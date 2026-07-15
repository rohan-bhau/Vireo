"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/store/authApi";
import { setCredentials } from "@/store/authSlice";
import { setTokens } from "@/lib/auth";
import { GuestGuard } from "@/components/auth/guest-guard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();
      setTokens(result.data.accessToken, result.data.refreshToken);
      dispatch(setCredentials(result.data));
      router.replace("/workspaces");
    } catch (err: any) {
      setError(err?.data?.message || "Invalid email or password");
    }
  }

  return (
    <GuestGuard>
      <div className="flex min-h-screen">
        <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <span className="text-2xl font-bold tracking-tight text-[#121C28]">
                Vireo Pro
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#121C28]">
              Welcome back
            </h1>
            <p className="mt-2 text-base text-black">
              Log in to your engineering workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Input
                label="Work Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-black">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-black transition-colors hover:text-[#004AC6]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-[#C3C6D7] bg-white px-3 py-2.5 text-sm text-[#121C28] placeholder:text-[#6B7280] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C3C6D7]" />
              </div>
              <div className="relative flex justify-center text-xs font-medium text-[#737686]">
                <span className="bg-white px-4">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#C3C6D7] px-4 py-2.5 text-xs font-medium text-[#121C28] transition-colors hover:bg-[#F8F9FF]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#C3C6D7] px-4 py-2.5 text-xs font-medium text-[#121C28] transition-colors hover:bg-[#F8F9FF]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#121C28">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                </svg>
                GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-black">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-black transition-colors hover:text-[#004AC6]"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden w-1/2 items-center justify-center bg-[#EEF4FF] p-12 lg:flex">
          <div className="max-w-sm text-center">
            <div className="mb-6 flex items-center justify-center">
              <div className="relative h-48 w-48">
                <div className="absolute inset-0 rounded-full bg-[#2563EB]/10 blur-[64px]" />
                <div className="relative flex h-full items-center justify-center">
                  <svg
                    className="h-24 w-24 text-[#2563EB]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-[#121C28]">
              AI-Powered Engineering Intelligence
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-black">
              Connect your existing tools and gain unparalleled clarity into
              your development lifecycle with automated insights.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-black">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              System Status: Operational
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
