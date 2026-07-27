import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes intelligently, resolving conflicts
 * (e.g. "p-2 p-4" -> "p-4") while preserving conditional classnames.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string for display, never rendering the raw
 * "Invalid Date" string a bad/missing value would otherwise produce.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "Date unavailable";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}