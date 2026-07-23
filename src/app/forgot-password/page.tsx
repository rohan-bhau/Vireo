"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
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
            {sent ? (
              <>
                <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                  Check your email
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-[#121C28]">{email}</span>.
                  Please check your inbox and follow the instructions.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex text-sm font-medium text-[#121C28] transition-colors hover:text-[#6B7280]"
                >
                  &larr; Back to sign in
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-[22px] font-semibold tracking-tight text-[#121C28]">
                  Reset your password
                </h1>
                <p className="mt-1.5 text-sm text-[#6B7280]">
                  Enter your email and we&apos;ll send you a link to get back into your account.
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
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full cursor-pointer bg-[#121C28] text-white hover:bg-[#1E293B]"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </form>
                <Link
                  href="/login"
                  className="mt-6 inline-flex text-sm font-medium text-[#6B7280] transition-colors hover:text-[#121C28]"
                >
                  &larr; Back to sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
