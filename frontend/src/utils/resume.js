export const splitCommaValues = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const splitLineValues = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export const joinLineValues = (items) => (items?.length ? items.join("\n") : "");

export const normalizeAtsJobDescription = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 8) {
    return trimmed;
  }

  return `Target role requirements: ${trimmed.replace(/\n+/g, ", ")}`;
};

export const buildResumePayload = (form) => ({
  name: form.name,
  email: form.email || null,
  phone: form.phone || null,
  location: form.location || null,
  linkedin: form.linkedin || null,
  website: form.website || null,
  target_role: form.target_role || null,
  summary: form.summary || null,
  education: form.education,
  extra_notes: form.extra_notes || null,
  save_title: form.save_title || "AI Optimized Resume",
  certifications: splitCommaValues(form.certifications),
  skills: {
    languages: splitCommaValues(form.languages),
    frameworks: splitCommaValues(form.frameworks),
    tools: splitCommaValues(form.tools),
  },
  experience: form.experience
    .filter((item) => item.role.trim())
    .map((item) => ({
      role: item.role,
      company: item.company || null,
      achievements: splitLineValues(item.achievementsText),
    })),
  projects: form.projects
    .filter((item) => item.title.trim())
    .map((item) => ({
      title: item.title,
      description: item.description || null,
      achievements: splitLineValues(item.achievementsText),
    })),
});

export const hydrateGeneratedResume = (resume, form) => ({
  ...resume,
  headline: resume.headline || form.target_role || "ATS Optimized Resume",
  contact: {
    email: resume.contact?.email || form.email || "",
    phone: resume.contact?.phone || form.phone || "",
    location: resume.contact?.location || form.location || "",
    linkedin: resume.contact?.linkedin || form.linkedin || "",
    website: resume.contact?.website || form.website || "",
  },
  skills: {
    languages: resume.skills?.languages || [],
    frameworks: resume.skills?.frameworks || [],
    tools: resume.skills?.tools || [],
  },
  experience: resume.experience || [],
  projects: resume.projects || [],
});

export const resumeToChatContext = (resume) => {
  if (!resume) {
    return "";
  }

  const experience = (resume.experience || [])
    .map((item) => `${item.role}: ${(item.points || []).join("; ")}`)
    .join("\n");
  const projects = (resume.projects || [])
    .map((item) => `${item.title}: ${(item.points || []).join("; ")}`)
    .join("\n");

  return [
    resume.name,
    resume.headline,
    resume.summary,
    `Skills: ${(resume.skills?.languages || []).concat(resume.skills?.frameworks || [], resume.skills?.tools || []).join(", ")}`,
    experience,
    projects,
    `Education: ${resume.education}`,
  ]
    .filter(Boolean)
    .join("\n");
};
