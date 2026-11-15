import type { Job } from "./types";

/** A job is open when published and its deadline (if any) hasn't passed. */
export function isOpen(job: Job, now = new Date()) {
  if (job.status !== "published") return false;
  if (!job.deadline) return true;
  const end = new Date(`${job.deadline}T23:59:59+06:00`); // Dhaka time
  return isNaN(end.getTime()) || end >= now;
}

export function formatDeadline(d: string) {
  const date = new Date(`${d}T12:00:00+06:00`);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
