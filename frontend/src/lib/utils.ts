import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes intelligently, resolving conflicts
 * (e.g. "p-2 p-4" -> "p-4") while preserving conditional classnames.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
