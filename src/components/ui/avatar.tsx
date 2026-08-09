import { clsx } from "clsx";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  name,
  email,
  avatar,
  size = "md",
  className,
}: AvatarProps) {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name || email || "avatar"}
        className={clsx("flex-shrink-0 rounded-full object-cover", SIZE_CLASSES[size], className)}
      />
    );
  }

  const initials = (name || email || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, name ? 2 : 1) || "?";

  return (
    <div
      className={clsx(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-bold text-white",
        SIZE_CLASSES[size],
        className
      )}
    >
      {initials}
    </div>
  );
}