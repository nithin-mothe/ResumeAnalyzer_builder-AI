import axios from "axios";
import { supabase } from "../lib/supabase";

const API_TIMEOUT_MS = 180000;
const BACKEND_WAKE_WINDOW_MS = 5 * 60 * 1000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: API_TIMEOUT_MS,
});

let lastBackendReadyAt = 0;

api.interceptors.request.use(async (config) => {
  if (!supabase) {
    return config;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getApiErrorMessage(error);
    return Promise.reject(new Error(message));
  }
);

function getApiErrorMessage(error) {
  if (error.code === "ECONNABORTED") {
    return "The backend took too long to respond. On Render free tier the first request can take about a minute while the server wakes up. Please wait a moment and try again.";
  }

  if (!error.response && error.message === "Network Error") {
    return "The app could not reach the backend. Check that the deployed frontend is allowed in Render CORS settings and that VITE_API_BASE_URL points to the live backend URL.";
  }

  return error.response?.data?.error?.message || error.response?.data?.message || error.message || "Request failed.";
}

async function ensureBackendReady() {
  if (!api.defaults.baseURL?.startsWith("http")) {
    return;
  }

  const now = Date.now();
  if (now - lastBackendReadyAt < BACKEND_WAKE_WINDOW_MS) {
    return;
  }

  try {
    await api.get("/health", { timeout: API_TIMEOUT_MS });
    lastBackendReadyAt = Date.now();
  } catch (_error) {
    // Let the real API request run next so users still get the best available error.
  }
}

export const uploadResume = async (file) => {
  await ensureBackendReady();
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload_resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const analyzeResume = async (payload) => {
  await ensureBackendReady();
  const { data } = await api.post("/analyze-resume", payload);
  return data;
};

export const atsMatchResume = async (payload) => {
  await ensureBackendReady();
  const { data } = await api.post("/ats-match", payload);
  return data;
};

export const buildResume = async (payload) => {
  await ensureBackendReady();
  const { data } = await api.post("/ai-resume-builder", payload);
  return data;
};

export const redesignResume = async (payload) => {
  await ensureBackendReady();
  const { data } = await api.post("/redesign-resume", payload);
  return data;
};

export const chatWithResume = async (payload) => {
  await ensureBackendReady();
  const { data } = await api.post("/resume-chat", payload);
  return data;
};

export const generateResumePdf = async (resume, templateId = "executive") => {
  await ensureBackendReady();
  const response = await api.post(
    "/generate-resume-pdf",
    { resume, template_id: templateId },
    { responseType: "blob" }
  );
  return response.data;
};

export const getResume = async (resumeId) => {
  await ensureBackendReady();
  const { data } = await api.get(`/resume/${resumeId}`);
  return data;
};
