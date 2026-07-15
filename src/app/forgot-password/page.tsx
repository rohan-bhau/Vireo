"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate sending reset link — backend endpoint not built yet
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 1000);
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="text-2xl font-bold tracking-tight text-[#121C28]">
              Vireo Pro
            </span>
          </div>
          {sent ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-[#121C28]">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-[#434655]">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-[#121C28]">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-xs font-medium text-[#004AC6] transition-colors hover:underline"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-[#121C28]">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-[#434655]">
                Enter your email and we&apos;ll send you a link to get back
                into your account.
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
                  className="placeholder:text-[#737686]/60"
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>

              <Link
                href="/login"
                className="mt-6 inline-block text-xs font-medium text-[#004AC6] transition-colors hover:underline"
              >
                Back to sign in
              </Link>
            </>
          )}

          <p className="mt-12 text-center text-[11px] font-semibold text-[#737686]/50">
            &copy; 2024 Vireo Technologies. All rights reserved.
          </p>
        </div>
      </div>

      <div className="hidden w-1/2 items-center justify-center bg-[#27313E] p-12 lg:flex">
        <div className="max-w-sm text-center">
          <div className="mb-6">
            <div className="mx-auto h-32 w-32 rounded-2xl bg-white/10 p-4 backdrop-blur-[24px]">
              <div className="text-lg font-bold text-[#EAEFFF]">
                System Intelligence
              </div>
              <div className="mt-2 text-xs text-white/60">
                Project Status: Optimizing
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#EAEFFF]">
            Secure AI Infrastructure
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Trusted by 2,000+ engineering teams to automate workflows and
            maintain SOC2 compliance effortlessly.
          </p>
          <div className="mt-8 text-xs text-[#C3C6D7]">v2.4.0 Stable</div>
        </div>
      </div>
    </div>
  );
}
