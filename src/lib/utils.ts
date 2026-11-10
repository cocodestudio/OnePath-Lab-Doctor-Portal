import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names with clsx and tailwind-merge
 * Standard shadcn/ui utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

