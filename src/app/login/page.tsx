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
import { OAuthButtons } from "@/components/auth/oauth-buttons";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      setTokens(result.accessToken, result.refreshToken);
      dispatch(setCredentials(result));
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
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D1D5DB] text-[#004AC6] focus:ring-[#004AC6]"
                />
                <label htmlFor="remember-me" className="text-sm text-[#6B7280] cursor-pointer select-none">
                  Remember me
                </label>
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
            <OAuthButtons />
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
