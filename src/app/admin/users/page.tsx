"use client";

import { useState } from "react";
import { useGetAdminUsersQuery, useUpdateUserRoleMutation } from "@/store/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Search, Shield, ShieldOff, ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading } = useGetAdminUsersQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const authApi = "authApi" as any;

  function handleSearch(value: string) {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }

  async function handleToggleRole(userId: string, currentRole: "user" | "admin") {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try { await updateRole({ userId, role: newRole }).unwrap(); } catch {}
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError("All fields are required");
      return;
    }
    setIsCreating(true);
    try {
      const { useRegisterMutation } = await import("@/store/authApi");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create user");
      setShowCreate(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#121C28]">User Management</h1>
          <p className="mt-1 text-sm text-[#737686]">
            Manage all users across the platform. {data && `(${data.total} total)`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" /> Create User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#121C28] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#C3C6D7]/20">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C3C6D7]/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#737686]">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
                </td>
              </tr>
            ) : data?.users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#737686]">No users found</td>
              </tr>
            ) : (
              data?.users.map((user) => (
                <tr key={user._id} className="hover:bg-[#F8F9FF]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                        {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-[#121C28]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#737686]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      user.role === "admin"
                        ? "bg-[#EEF4FF] text-[#004AC6]"
                        : "bg-[#F0F0F5] text-[#737686]"
                    }`}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${user.isEmailVerified ? "text-green-600" : "text-[#C3C6D7]"}`}>
                      {user.isEmailVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={isUpdating}
                      onClick={() => handleToggleRole(user._id, user.role)}
                    >
                      {user.role === "admin" ? (
                        <><ShieldOff className="mr-1 h-3.5 w-3.5" /> Demote</>
                      ) : (
                        <><Shield className="mr-1 h-3.5 w-3.5" /> Make Admin</>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[#737686]">Page {data.page} of {data.totalPages}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {createError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</div>}
          <Input label="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Jane Smith" />
          <Input label="Email address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="jane@company.com" />
          <Input label="Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Min 6 characters" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create User</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
