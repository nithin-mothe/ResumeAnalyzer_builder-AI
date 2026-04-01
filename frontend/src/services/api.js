import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 60000,
});

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
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Request failed.";
    return Promise.reject(new Error(message));
  }
);

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload_resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const analyzeResume = async (payload) => {
  const { data } = await api.post("/analyze-resume", payload);
  return data;
};

export const atsMatchResume = async (payload) => {
  const { data } = await api.post("/ats-match", payload);
  return data;
};

export const buildResume = async (payload) => {
  const { data } = await api.post("/ai-resume-builder", payload);
  return data;
};

export const redesignResume = async (payload) => {
  const { data } = await api.post("/redesign-resume", payload);
  return data;
};

export const chatWithResume = async (payload) => {
  const { data } = await api.post("/resume-chat", payload);
  return data;
};

export const generateResumePdf = async (resume, templateId = "executive") => {
  const response = await api.post(
    "/generate-resume-pdf",
    { resume, template_id: templateId },
    { responseType: "blob" }
  );
  return response.data;
};

export const getResume = async (resumeId) => {
  const { data } = await api.get(`/resume/${resumeId}`);
  return data;
};
