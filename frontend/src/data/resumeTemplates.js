export const resumeTemplates = [
  {
    id: "executive",
    name: "Executive Edge",
    shortLabel: "Executive",
    accent: "#b85f2d",
    description: "Balanced, ATS-friendly, and ideal for strong leadership or senior IC resumes.",
    bestFor: "Google, Amazon, Microsoft, platform roles",
  },
  {
    id: "modern",
    name: "Modern Signal",
    shortLabel: "Modern",
    accent: "#255f85",
    description: "A sharper visual style with stronger hierarchy for product and startup applications.",
    bestFor: "Product companies, startups, growth-stage teams",
  },
  {
    id: "compact",
    name: "Compact Pro",
    shortLabel: "Compact",
    accent: "#1d7c63",
    description: "Dense but clean layout for candidates with high-signal experience and many skills.",
    bestFor: "Experienced engineers, consultants, technical leads",
  },
];

export const resumeTemplateMap = Object.fromEntries(
  resumeTemplates.map((template) => [template.id, template])
);

