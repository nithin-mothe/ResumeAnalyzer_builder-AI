const PROFILE_STORAGE_KEY = "resumeForgeProfile";
const JOB_TRACKER_STORAGE_KEY = "resumeForgeJobTracker";

export const avatarOptions = [
  {
    id: "amber",
    label: "Amber",
    accent: "#cf6a2e",
    surface: "rgba(207, 106, 46, 0.18)",
  },
  {
    id: "teal",
    label: "Teal",
    accent: "#1b5c69",
    surface: "rgba(27, 92, 105, 0.18)",
  },
  {
    id: "pine",
    label: "Pine",
    accent: "#20755f",
    surface: "rgba(32, 117, 95, 0.18)",
  },
  {
    id: "wine",
    label: "Wine",
    accent: "#a01d4a",
    surface: "rgba(160, 29, 74, 0.16)",
  },
  {
    id: "gold",
    label: "Gold",
    accent: "#b2691b",
    surface: "rgba(178, 105, 27, 0.16)",
  },
];

const parseStoredJson = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
};

const emailToName = (email) => {
  const prefix = String(email || "").split("@")[0].replace(/[._-]+/g, " ").trim();
  if (!prefix) {
    return "ResumeForge Member";
  }

  return prefix.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getDefaultAvatarTone = (user) => {
  const seed = String(user?.email || user?.id || "resumeforge");
  const sum = seed.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return avatarOptions[sum % avatarOptions.length].id;
};

export const getStoredProfile = () =>
  parseStoredJson(PROFILE_STORAGE_KEY, {
    full_name: "",
    headline: "",
    location: "",
    about: "",
    career_goal: "",
    avatar_tone: "",
  });

export const saveStoredProfile = (profile) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const getUserProfile = (user) => {
  const stored = getStoredProfile();
  const metadata = user?.user_metadata || {};

  return {
    full_name:
      metadata.full_name || metadata.name || stored.full_name || emailToName(user?.email),
    headline: metadata.headline || stored.headline || "AI resume strategist",
    location: metadata.location || stored.location || "",
    about:
      metadata.about ||
      stored.about ||
      "Focused on building stronger resumes, sharper company targeting, and cleaner application follow-through.",
    career_goal:
      metadata.career_goal || stored.career_goal || "Land higher-quality interviews with tailored resumes.",
    avatar_tone: metadata.avatar_tone || stored.avatar_tone || getDefaultAvatarTone(user),
    avatar_url: metadata.avatar_url || "",
  };
};

export const getDisplayName = (user) => getUserProfile(user).full_name;

export const getAvatarInitials = (user) => {
  const profile = getUserProfile(user);
  const source = profile.full_name || user?.email || "RF";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return initials || "RF";
};

export const getAvatarTone = (toneId) =>
  avatarOptions.find((option) => option.id === toneId) || avatarOptions[0];

export const getAvatarPresentation = (user) => {
  const profile = getUserProfile(user);
  const tone = getAvatarTone(profile.avatar_tone);

  return {
    imageUrl: profile.avatar_url,
    initials: getAvatarInitials(user),
    tone,
    style: {
      "--avatar-accent": tone.accent,
      "--avatar-surface": tone.surface,
    },
  };
};

export const getProfileStats = () => {
  const jobs = parseStoredJson(JOB_TRACKER_STORAGE_KEY, []);
  const latestResumeText =
    typeof window !== "undefined" ? window.localStorage.getItem("latestResumeText") || "" : "";
  const builtResume =
    typeof window !== "undefined" ? window.localStorage.getItem("latestBuiltResume") : null;
  const redesignedResume =
    typeof window !== "undefined" ? window.localStorage.getItem("latestRedesignedResume") : null;
  const trackedCompanies = new Set(jobs.map((job) => job.company).filter(Boolean));

  return {
    parsedWords: latestResumeText.split(/\s+/).filter(Boolean).length,
    savedDrafts: [builtResume, redesignedResume].filter(Boolean).length,
    jobsTracked: jobs.length,
    trackedCompanies: trackedCompanies.size,
    interviews: jobs.filter((job) => job.status === "Interview").length,
    offers: jobs.filter((job) => job.status === "Offer").length,
  };
};

export const getAuthProviderLabel = (user) => {
  const provider = user?.app_metadata?.provider || user?.identities?.[0]?.provider || "email";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

export const formatMemberSince = (user) => {
  if (!user?.created_at) {
    return "Recently joined";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(user.created_at));
  } catch (_error) {
    return "Recently joined";
  }
};
