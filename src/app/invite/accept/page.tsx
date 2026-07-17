"use client";

import { useEffect, useState, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useAcceptInvitationMutation } from "@/store/workspaceApi";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const [accept] = useAcceptInvitationMutation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const returnUrl = token ? `/invite/accept?token=${token}` : "/invite/accept";
      router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    if (status !== "idle") return;
    startTransition(() => setStatus("loading"));
    accept(token!)
      .unwrap()
      .then(() => {
        setStatus("success");
        setTimeout(() => router.replace("/workspaces"), 2000);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(
          (err as { data?: { message?: string } })?.data?.message ||
            "Failed to accept invitation. The link may have expired."
        );
      });
  }, [authLoading, isAuthenticated, token, accept, router, status]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F0F5] px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#121C28]">Invalid invitation link</h1>
          <p className="mt-2 text-sm text-[#737686]">No invitation token provided.</p>
          <button
            onClick={() => router.replace("/workspaces")}
            className="mt-6 rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Go to workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F5] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        {(status === "loading" || authLoading) && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
            <h1 className="text-lg font-semibold text-[#121C28]">Accepting invitation...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-[#121C28]">Welcome aboard!</h1>
            <p className="mt-2 text-sm text-[#737686]">
              You&apos;ve joined the workspace. Redirecting you now...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-[#121C28]">Invitation failed</h1>
            <p className="mt-2 text-sm text-[#737686]">{error}</p>
            <button
              onClick={() => router.replace("/workspaces")}
              className="mt-6 rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Go to workspaces
            </button>
          </>
        )}
      </div>
    </div>
  );
}
