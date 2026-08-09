export const AVATAR_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#059669",
  "#0D9488",
  "#4F46E5",
  "#C026D3",
  "#6366F1",
];

export function generateAvatarSvg(name: string, color: string): string {
  const initial = Array.from(name.trim() || "W")[0]?.toUpperCase() || "W";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${color}"/><text x="32" y="42" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">${escapeSvg(initial)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function defaultAvatarFor(name: string): string {
  let hash = 0;
  for (const ch of Array.from(name.trim() || "W")) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return generateAvatarSvg(name, AVATAR_COLORS[hash % AVATAR_COLORS.length]);
}

function escapeSvg(ch: string): string {
  return ch
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}