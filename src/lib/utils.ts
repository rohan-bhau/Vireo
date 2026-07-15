import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateKey(projectKey: string, sequence: number): string {
  return `${projectKey}-${sequence}`;
}
