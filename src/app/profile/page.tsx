"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store";
import { useUpdateProfileMutation, useLogoutMutation } from "@/store/authApi";
import { setUser, logout } from "@/store/authSlice";
import { clearTokens } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [doLogout] = useLogoutMutation();

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile({ name }).unwrap();
      dispatch(setUser(result.data.user));
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to update profile");
    }
  }

  async function handleLogout() {
    try {
      await doLogout();
    } catch {
      // proceed regardless
    }
    clearTokens();
    dispatch(logout());
    router.replace("/login");
  }

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8F9FF]">
        <header className="border-b border-[#C3C6D7]/20 bg-white">
          <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-[#121C28]">Profile</h1>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[#434655] transition-colors hover:text-red-600"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-xl font-bold text-white">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#121C28]">
                  {user.name}
                </h2>
                <p className="text-sm text-[#434655]">{user.email}</p>
                <span className="mt-1 inline-block rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-[11px] font-medium capitalize text-[#004AC6]">
                  {user.role}
                </span>
              </div>
            </div>

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label className="text-xs font-semibold text-[#434655]">
                  Email
                </label>
                <div className="mt-1.5 rounded-lg border border-[#C3C6D7] bg-gray-50 px-3 py-2.5 text-sm text-[#737686]">
                  {user.email}
                </div>
                <p className="mt-1 text-xs text-[#737686]">
                  Email cannot be changed.
                </p>
              </div>

              <Button type="submit" isLoading={isLoading}>
                Save Changes
              </Button>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
