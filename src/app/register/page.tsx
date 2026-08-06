"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { EmailVerification } from "@/components/auth/email-verification";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { useRegisterMutation, type AuthData } from "@/store/authApi";
import { setCredentials, setOnboardingNeeded } from "@/store/authSlice";
import { setTokens } from "@/lib/auth";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [mode, setMode] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await register({ name, email, password }).unwrap();
      setMode("otp");
    } catch (err: unknown) {
      setError(
        (err as { data?: { message?: string } })?.data?.message || "Registration failed"
      );
    }
  }

  function handleVerified(data: AuthData) {
    setTokens(data.accessToken, data.refreshToken);
    dispatch(setCredentials(data));
    dispatch(setOnboardingNeeded(true));
    router.replace("/dashboard");
  }

  if (mode === "otp") {
    return (
      <GuestGuard>
        <EmailVerification
          email={email}
          onVerified={handleVerified}
          onBack={() => setMode("form")}
        />
      </GuestGuard>
    );
  }

  return (
    <GuestGuard>
      <AuthSplitLayout variant="register">
        <AuthCard>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Get started with your engineering workspace.
          </p>

          <form onSubmit={handleAccountSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-[3px] border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary transition-colors hover:text-text"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full cursor-pointer"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 text-xs text-text-tertiary">
                or continue with
              </span>
            </div>
          </div>

          <OAuthButtons />

          <p className="mt-7 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </AuthCard>
      </AuthSplitLayout>
    </GuestGuard>
  );
}