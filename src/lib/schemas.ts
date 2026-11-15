import { z } from "zod";
import type { CollectionName } from "./types";

const str = z.string().default("");
const strs = z.array(z.string()).default([]);
const pillar = z.enum(["content", "analytics", "production"]);
const slug = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only use lowercase letters, numbers and dashes");

const work = z.object({
  slug,
  title: z.string().min(1, "Title is required"),
  client: str,
  category: str,
  date: str,
  readTime: str.optional(),
  pillars: z.array(pillar).default([]),
  focus: str,
  summary: str,
  description: str,
  challenge: str,
  execution: str,
  outcome: str,
  scope: strs,
  highlights: strs,
  metrics: z.array(z.object({ value: str, label: str })).default([]),
  cover: str,
  video: str,
  gallery: strs,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().default(0),
});

const member = z.object({
  id: slug,
  name: z.string().min(1, "Name is required"),
  role: str,
  department: z.enum(["leadership", "content", "analytics", "production", "operations"]).default("production"),
  photo: str,
  bio: str,
  linkedin: str,
  published: z.boolean().default(true),
  order: z.number().default(0),
});

const service = z.object({
  id: pillar,
  name: z.string().min(1),
  intro: str,
  items: z.array(z.object({ title: z.string().min(1), description: str })).default([]),
});

const job = z.object({
  slug,
  title: z.string().min(1, "Title is required"),
  tagline: str,
  intro: str,
  department: str,
  type: str,
  location: str,
  responsibilities: strs,
  requirements: strs,
  preferred: strs,
  offer: strs,
  extraHeading: str,
  extra: strs,
  applyEmail: str,
  subjectLine: str,
  deadline: str,
  status: z.enum(["published", "closed", "draft"]).default("draft"),
  image: str,
  order: z.number().default(0),
});

const titled = z.array(z.object({ title: str, text: str }));

const site = z.object({
  company: z.object({
    name: str, legalName: str, tagline: str, email: str, careersEmail: str, phone: str,
    addressLines: strs, mapUrl: str, hours: str,
  }),
  socials: z.array(z.object({ label: str, url: str })),
  seo: z.object({ title: str, description: str, ogImage: str }),
  hero: z.object({ eyebrow: str, lineOne: str, emphasis: str, lineTwo: str, intro: str, showreel: str, poster: str }),
  statement: z.object({ text: str, emphasis: str, body: str }),
  pillars: z.array(z.object({ id: pillar, label: str, kicker: str, text: str })),
  stats: z.array(z.object({ value: z.number(), suffix: str, label: str })),
  process: titled,
  about: z.object({
    headline: str, emphasis: str, headlineEnd: str, paragraphs: strs, beliefs: titled, quote: str, teamImage: str,
  }),
  clients: z.array(z.object({ name: str, logo: str, color: str, wordmark: z.boolean().default(false) })),
  cta: z.object({ headline: str, emphasis: str, text: str }),
  directors: strs,
  careersIntro: z.object({ headline: str, emphasis: str, text: str }),
  faq: z.array(z.object({ q: str, a: str })),
  legal: z.object({ privacy: titled, terms: titled }),
});

function uniqueBy<T>(key: keyof T, label: string) {
  return (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<unknown>();
    for (const it of items) {
      if (seen.has(it[key])) ctx.addIssue({ code: "custom", message: `Duplicate ${label}: ${String(it[key])}` });
      seen.add(it[key]);
    }
  };
}

export const SCHEMAS: Record<CollectionName, z.ZodTypeAny> = {
  site,
  works: z.array(work).superRefine(uniqueBy("slug", "slug")),
  team: z.array(member).superRefine(uniqueBy("id", "id")),
  services: z.array(service),
  jobs: z.array(job).superRefine(uniqueBy("slug", "slug")),
};

export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(120),
  email: z.string().trim().email("Please use a valid email").max(200),
  company: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(40).default(""),
  services: z.array(z.string().max(60)).max(10).default([]),
  budget: z.string().trim().max(120).default(""),
  timeline: z.string().max(60).default(""),
  message: z.string().trim().min(1, "Tell us a little about the project").max(5000),
  website: z.string().max(0).optional(), // honeypot — must stay empty
});
