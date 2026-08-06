"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/store/authApi";
import { setCredentials } from "@/store/authSlice";
import { setTokens } from "@/lib/auth";
import { GuestGuard } from "@/components/auth/guest-guard";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { Eye, EyeOff } from "lucide-react";

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
    <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-text">Welcome back</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Sign in to your account to continue.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-[3px] border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-text-tertiary transition-colors hover:text-text"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded-[2px] border-border-default accent-primary"
          />
          <label
            htmlFor="remember-me"
            className="cursor-pointer select-none text-sm text-text-secondary"
          >
            Remember me
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full cursor-pointer" isLoading={isLoading}>
          Sign In
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
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary transition-colors hover:text-primary-dark"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <AuthSplitLayout variant="login">
          <LoginForm />
        </AuthSplitLayout>
      </Suspense>
    </GuestGuard>
  );
}