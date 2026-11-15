import type { Field } from "./Fields";

const PILLARS = [
  { value: "content", label: "Content" },
  { value: "analytics", label: "Analytics" },
  { value: "production", label: "Production" },
];

export const WORK_FIELDS: Field[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "slug", label: "URL slug", type: "slug", from: "title", help: "cap.direct/work/<slug>" },
  { key: "client", label: "Client", type: "text" },
  { key: "category", label: "Category", type: "text", placeholder: "Product Launch Content" },
  { key: "date", label: "Date", type: "text", placeholder: "November 2024" },
  { key: "focus", label: "Focus", type: "text", placeholder: "Strategy, identity and web delivery" },
  { key: "pillars", label: "Pillars", type: "multiselect", options: PILLARS, help: "Shows coloured dots and powers the filter on /work" },
  {
    key: "cover",
    label: "Cover (image or video)",
    type: "media",
    accept: "any",
    folder: (w) => `works/${w.slug || "new"}`,
    help: "Shown in the grids and at the top of the case study",
    wide: true,
  },
  {
    key: "video",
    label: "Showcase video",
    type: "media",
    accept: "video",
    folder: (w) => `works/${w.slug || "new"}`,
    help: "Optional. Plays on hover in grids and replaces the cover on the case-study page",
    wide: true,
  },
  { key: "summary", label: "One-line summary", type: "textarea", rows: 2 },
  { key: "description", label: "Overview", type: "textarea", rows: 5 },
  { key: "challenge", label: "The challenge", type: "textarea", rows: 5 },
  { key: "execution", label: "What we did", type: "textarea", rows: 5 },
  { key: "outcome", label: "The outcome", type: "textarea", rows: 5 },
  {
    key: "metrics",
    label: "Results",
    type: "list",
    itemLabel: (m) => `${m.value || "?"} — ${m.label || ""}`,
    fields: [
      { key: "value", label: "Number", type: "text", placeholder: "3.2×" },
      { key: "label", label: "Label", type: "text", placeholder: "Engagement lift" },
    ],
  },
  { key: "scope", label: "Scope tags", type: "strings" },
  { key: "highlights", label: "Highlights", type: "strings" },
  { key: "gallery", label: "Gallery", type: "gallery", folder: (w) => `works/${w.slug || "new"}` },
  { key: "featured", label: "Featured on homepage", type: "toggle" },
  { key: "published", label: "Published", type: "toggle", help: "Off = hidden from the public site" },
];

export const TEAM_FIELDS: Field[] = [
  { key: "name", label: "Full name", type: "text" },
  { key: "id", label: "ID", type: "slug", from: "name" },
  { key: "role", label: "Role / title", type: "text" },
  {
    key: "department",
    label: "Department",
    type: "select",
    options: [
      { value: "leadership", label: "Leadership" },
      { value: "content", label: "Content" },
      { value: "analytics", label: "Analytics" },
      { value: "production", label: "Production" },
      { value: "operations", label: "Operations" },
    ],
  },
  { key: "photo", label: "Photo", type: "media", accept: "image", folder: () => "team", help: "Square or 4:5 portrait works best", wide: true },
  { key: "bio", label: "Short bio", type: "textarea", rows: 3 },
  { key: "linkedin", label: "LinkedIn URL", type: "url" },
  { key: "published", label: "Show on website", type: "toggle" },
];

export const JOB_FIELDS: Field[] = [
  { key: "title", label: "Job title", type: "text" },
  { key: "slug", label: "URL slug", type: "slug", from: "title" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "published", label: "Published (accepting applications)" },
      { value: "closed", label: "Closed (visible, not accepting)" },
      { value: "draft", label: "Draft (hidden)" },
    ],
  },
  { key: "deadline", label: "Deadline", type: "date", help: "Closes automatically after this date" },
  { key: "department", label: "Department", type: "text" },
  { key: "type", label: "Type", type: "text", placeholder: "Full-Time" },
  { key: "location", label: "Location", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "intro", label: "Introduction", type: "textarea", rows: 4 },
  { key: "responsibilities", label: "Key responsibilities", type: "strings" },
  { key: "requirements", label: "Requirements", type: "strings" },
  { key: "preferred", label: "Preferred skills", type: "strings" },
  { key: "offer", label: "What we offer", type: "strings" },
  { key: "extraHeading", label: "Extra section heading", type: "text", placeholder: "How to apply" },
  { key: "extra", label: "Extra section lines", type: "strings" },
  { key: "applyEmail", label: "Apply-to email", type: "email" },
  { key: "subjectLine", label: "Email subject line", type: "text" },
  { key: "image", label: "Job circular image", type: "media", accept: "image", folder: () => "careers", wide: true },
];

export const SERVICE_FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "intro", label: "Intro", type: "textarea", rows: 3 },
  {
    key: "items",
    label: "Services",
    type: "list",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea", rows: 2 },
    ],
  },
];

const titled: Field[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "text", label: "Text", type: "textarea", rows: 3 },
];

/** Site settings, split into tabs. */
export const SITE_TABS: { id: string; label: string; fields: Field[] }[] = [
  {
    id: "company",
    label: "Company & contact",
    fields: [
      {
        key: "company",
        label: "Company",
        type: "group",
        fields: [
          { key: "name", label: "Short name", type: "text" },
          { key: "legalName", label: "Legal name", type: "text" },
          { key: "tagline", label: "Tagline", type: "text" },
          { key: "email", label: "Main email", type: "email" },
          { key: "careersEmail", label: "Careers email", type: "email" },
          { key: "phone", label: "Phone", type: "text" },
          { key: "hours", label: "Office hours", type: "text" },
          { key: "mapUrl", label: "Google Maps link", type: "url" },
          { key: "addressLines", label: "Address lines", type: "strings" },
        ],
      },
      {
        key: "socials",
        label: "Social links",
        type: "list",
        fields: [
          { key: "label", label: "Network", type: "text" },
          { key: "url", label: "URL", type: "url" },
        ],
      },
      {
        key: "seo",
        label: "Search & sharing",
        type: "group",
        fields: [
          { key: "title", label: "Default page title", type: "text", wide: true },
          { key: "description", label: "Meta description", type: "textarea", rows: 2 },
          { key: "ogImage", label: "Share image (1200×630)", type: "media", accept: "image", folder: () => "brand", wide: true },
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Homepage",
    fields: [
      {
        key: "hero",
        label: "Hero",
        type: "group",
        help: "Headline = line one + italic word, then line two",
        fields: [
          { key: "eyebrow", label: "Small label", type: "text" },
          { key: "lineOne", label: "Headline line one", type: "text" },
          { key: "emphasis", label: "Italic word", type: "text" },
          { key: "lineTwo", label: "Headline line two", type: "text" },
          { key: "intro", label: "Intro paragraph", type: "textarea", rows: 3 },
          { key: "showreel", label: "Showreel video", type: "media", accept: "video", folder: () => "showreel", wide: true },
          { key: "poster", label: "Showreel poster image (optional)", type: "media", accept: "image", folder: () => "showreel", wide: true },
        ],
      },
      {
        key: "statement",
        label: "Statement",
        type: "group",
        fields: [
          { key: "text", label: "Statement", type: "text" },
          { key: "emphasis", label: "Italic ending", type: "text" },
          { key: "body", label: "Supporting paragraph", type: "textarea", rows: 3 },
        ],
      },
      {
        key: "pillars",
        label: "Pillars",
        type: "list",
        itemLabel: (p) => p.label,
        fields: [
          { key: "id", label: "Pillar", type: "select", options: PILLARS },
          { key: "label", label: "Name", type: "text" },
          { key: "kicker", label: "Kicker", type: "text" },
          { key: "text", label: "Text", type: "textarea", rows: 3 },
        ],
      },
      {
        key: "stats",
        label: "Numbers",
        type: "list",
        itemLabel: (s) => `${s.value}${s.suffix} — ${s.label}`,
        fields: [
          { key: "value", label: "Number", type: "number" },
          { key: "suffix", label: "Suffix", type: "text", placeholder: "K+ / % / ×" },
          { key: "label", label: "Label", type: "text", wide: true },
        ],
      },
      {
        key: "clients",
        label: "Clients (logo marquee)",
        type: "list",
        itemLabel: (c) => c.name,
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "color", label: "Brand colour", type: "text", placeholder: "#e82890", help: "The partner's own colour — used for their name" },
          { key: "logo", label: "Logo", type: "media", accept: "image", folder: () => "clients", help: "A square logo mark works best (PNG, transparent)", wide: true },
          { key: "wordmark", label: "Logo already shows the name", type: "toggle", help: "On = show the logo alone (e.g. Walton, Helio)" },
        ],
      },
      { key: "process", label: "Process steps", type: "list", fields: titled },
      {
        key: "cta",
        label: "Footer call-to-action",
        type: "group",
        fields: [
          { key: "headline", label: "Headline", type: "text" },
          { key: "emphasis", label: "Italic part", type: "text" },
          { key: "text", label: "Text", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About & careers",
    fields: [
      {
        key: "about",
        label: "About page",
        type: "group",
        fields: [
          { key: "headline", label: "Headline start", type: "text" },
          { key: "emphasis", label: "Italic part", type: "text" },
          { key: "headlineEnd", label: "Headline end", type: "text", wide: true },
          { key: "paragraphs", label: "Paragraphs", type: "strings" },
          { key: "beliefs", label: "Beliefs", type: "list", fields: titled },
          { key: "quote", label: "Closing quote", type: "textarea", rows: 2 },
          { key: "teamImage", label: "Team photo", type: "media", accept: "any", folder: () => "careers", wide: true },
        ],
      },
      { key: "directors", label: "Directors (shown on the Team page)", type: "strings" },
      {
        key: "careersIntro",
        label: "Careers intro",
        type: "group",
        fields: [
          { key: "headline", label: "Headline", type: "text" },
          { key: "emphasis", label: "Italic part", type: "text" },
          { key: "text", label: "Text", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "faq",
    label: "FAQ & legal",
    fields: [
      {
        key: "faq",
        label: "FAQ",
        type: "list",
        fields: [
          { key: "q", label: "Question", type: "text", wide: true },
          { key: "a", label: "Answer", type: "textarea", rows: 3 },
        ],
      },
      {
        key: "legal",
        label: "Legal",
        type: "group",
        fields: [
          { key: "privacy", label: "Privacy sections", type: "list", fields: titled },
          { key: "terms", label: "Terms sections", type: "list", fields: titled },
        ],
      },
    ],
  },
];

export const NEW_WORK = () => ({
  slug: "",
  title: "New project",
  client: "",
  category: "",
  date: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
  readTime: "",
  pillars: [],
  focus: "",
  summary: "",
  description: "",
  challenge: "",
  execution: "",
  outcome: "",
  scope: [],
  highlights: [],
  metrics: [],
  cover: "",
  video: "",
  gallery: [],
  featured: true,
  published: false,
  order: 0,
});

export const NEW_MEMBER = () => ({ id: "", name: "New member", role: "", department: "production", photo: "", bio: "", linkedin: "", published: true, order: 0 });

export const NEW_JOB = () => ({
  slug: "",
  title: "New position",
  tagline: "",
  intro: "",
  department: "",
  type: "Full-Time",
  location: "Dhaka, Bangladesh",
  responsibilities: [],
  requirements: [],
  preferred: [],
  offer: [],
  extraHeading: "",
  extra: [],
  applyEmail: "office@cap.direct",
  subjectLine: "",
  deadline: "",
  status: "draft",
  image: "",
  order: 0,
});
