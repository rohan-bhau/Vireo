import { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[3px] border border-border-light bg-surface p-8 shadow-card sm:p-10">
      {children}
    </div>
  );
}
