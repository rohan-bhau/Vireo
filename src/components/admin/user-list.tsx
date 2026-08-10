"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
}

interface UserListProps {
  users: User[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRoleToggle?: (userId: string, currentRole: "user" | "admin") => void;
  onRemove?: (userId: string) => void;
  showSearch?: boolean;
}

export function UserList({
  users,
  isLoading,
  emptyMessage = "No users found",
  onRoleToggle,
  onRemove,
  showSearch = true,
}: UserListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div>
      {showSearch && (
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#C3C6D7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#121C28] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#C3C6D7]/20">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Role</th>
              {(onRoleToggle || onRemove) && (
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#737686]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C3C6D7]/10">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#737686]">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#737686]">{emptyMessage}</td>
              </tr>
            ) : (
              filtered.map((user) => (
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
                  {(onRoleToggle || onRemove) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onRoleToggle && (
                          <Button size="sm" variant="outline" onClick={() => onRoleToggle(user._id, user.role)}>
                            {user.role === "admin" ? "Demote" : "Promote"}
                          </Button>
                        )}
                        {onRemove && (
                          <Button size="sm" variant="ghost" onClick={() => onRemove(user._id)}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
