export type PillarId = "content" | "analytics" | "production";

export type Metric = { value: string; label: string };

export type Work = {
  slug: string;
  title: string;
  client: string;
  category: string;
  date: string;
  readTime?: string;
  pillars: PillarId[];
  focus: string;
  summary: string;
  description: string;
  challenge: string;
  execution: string;
  outcome: string;
  scope: string[];
  highlights: string[];
  metrics: Metric[];
  cover: string;
  video: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  order: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  department: "leadership" | "content" | "analytics" | "production" | "operations";
  photo: string;
  bio: string;
  linkedin: string;
  published: boolean;
  order: number;
};

export type ServiceGroup = {
  id: PillarId;
  name: string;
  intro: string;
  items: { title: string; description: string }[];
};

export type Job = {
  slug: string;
  title: string;
  tagline: string;
  intro: string;
  department: string;
  type: string;
  location: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  offer: string[];
  extraHeading: string;
  extra: string[];
  applyEmail: string;
  subjectLine: string;
  deadline: string;
  status: "published" | "closed" | "draft";
  image: string;
  order: number;
};

export type Site = {
  company: {
    name: string;
    legalName: string;
    tagline: string;
    email: string;
    careersEmail: string;
    phone: string;
    addressLines: string[];
    mapUrl: string;
    hours: string;
  };
  socials: { label: string; url: string }[];
  seo: { title: string; description: string; ogImage: string };
  hero: {
    eyebrow: string;
    lineOne: string;
    emphasis: string;
    lineTwo: string;
    intro: string;
    showreel: string;
    poster: string;
  };
  statement: { text: string; emphasis: string; body: string };
  pillars: { id: PillarId; label: string; kicker: string; text: string }[];
  stats: { value: number; suffix: string; label: string }[];
  process: { title: string; text: string }[];
  about: {
    headline: string;
    emphasis: string;
    headlineEnd: string;
    paragraphs: string[];
    beliefs: { title: string; text: string }[];
    quote: string;
    teamImage: string;
  };
  clients: { name: string; logo: string; color: string; wordmark: boolean }[];
  cta: { headline: string; emphasis: string; text: string };
  directors: string[];
  careersIntro: { headline: string; emphasis: string; text: string };
  faq: { q: string; a: string }[];
  legal: {
    privacy: { title: string; text: string }[];
    terms: { title: string; text: string }[];
  };
};

export type Collections = {
  site: Site;
  works: Work[];
  team: TeamMember[];
  services: ServiceGroup[];
  jobs: Job[];
};

export type CollectionName = keyof Collections;
export const COLLECTIONS: CollectionName[] = ["site", "works", "team", "services", "jobs"];

export type Role = "admin" | "editor";
export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
  /** When the password last changed. Sessions issued before this are rejected. */
  passwordChangedAt?: string;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  services: string[];
  budget: string;
  timeline: string;
  message: string;
  read: boolean;
};
