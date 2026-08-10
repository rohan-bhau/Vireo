export const PRESET_AVATARS = [
  "/avatars/workspace-1.svg",
  "/avatars/workspace-2.svg",
  "/avatars/workspace-3.svg",
  "/avatars/workspace-4.svg",
  "/avatars/workspace-5.svg",
  "/avatars/workspace-6.svg",
  "/avatars/workspace-7.svg",
  "/avatars/workspace-8.svg",
  "/avatars/workspace-9.svg",
  "/avatars/workspace-10.svg",
  "/avatars/workspace-11.svg",
  "/avatars/workspace-12.svg",
];

export function defaultAvatarFor(name: string): string {
  let hash = 0;
  for (const ch of Array.from(name.trim() || "W")) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return PRESET_AVATARS[hash % PRESET_AVATARS.length];
}

export function isPresetAvatar(avatar: string | null | undefined): boolean {
  return !!avatar && avatar.startsWith("/avatars/workspace-");
}