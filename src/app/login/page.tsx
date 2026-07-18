"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useLoginMutation } from "@/store/authApi";
import { setCredentials } from "@/store/authSlice";
import { setTokens } from "@/lib/auth";
import { GuestGuard } from "@/components/auth/guest-guard";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();
      setTokens(result.data.accessToken, result.data.refreshToken);
      dispatch(setCredentials(result.data));
      router.replace(redirectUrl || (activeWorkspaceId ? `/w/${activeWorkspaceId}` : "/dashboard"));
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ||
          "Invalid email or password"
      );
    }
  }

  return (
    <div className="relative flex min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA] to-[#EDEFF2]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#2563EB]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#2563EB]/6 to-transparent blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center px-6">
        <div className="w-full py-12">
          <div className="mb-10 flex justify-center">
            <Logo variant="full" className="h-10 w-auto" />
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-10 py-12 shadow-sm shadow-black/[0.02]">
            <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-[#6B7280]">
              Sign in to your account to continue.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm text-[#121C28] placeholder:text-[#9CA3AF] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#374151]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#9CA3AF] transition-colors hover:text-[#121C28]"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-2.5 pr-10 text-sm text-[#121C28] placeholder:text-[#9CA3AF] transition-shadow focus:border-[#121C28] focus:outline-none focus:ring-[3px] focus:ring-[#121C28]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#9CA3AF] transition-colors hover:text-[#374151]"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full cursor-pointer bg-[#121C28] text-white hover:bg-[#1E293B]" isLoading={isLoading}>
                Sign In
              </Button>
            </form>
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs text-[#9CA3AF]">
                <span className="bg-white px-3">or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-all hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:shadow-sm"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-all hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:shadow-sm"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#121C28">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-[#6B7280]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#121C28] transition-colors hover:text-[#6B7280]"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
