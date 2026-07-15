import Image from "next/image";

interface LogoProps {
  variant?: "icon" | "full";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/vireo-icon.svg"
        alt="Vireo"
        width={32}
        height={32}
        className={className}
      />
    );
  }

  return (
    <Image
      src="/vireo-logo.svg"
      alt="Vireo"
      width={180}
      height={52}
      className={className}
    />
  );
}
