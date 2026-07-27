"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Palette, Mail, Save } from "lucide-react";

export default function AdminSystemPage() {
  const [siteName, setSiteName] = useState("Vireo");
  const [siteDescription, setSiteDescription] = useState("AI-powered project management platform");
  const [mailHost, setMailHost] = useState("");
  const [mailPort, setMailPort] = useState("587");
  const [mailUser, setMailUser] = useState("");
  const [mailPass, setMailPass] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#121C28]">System Settings</h1>
        <p className="mt-1 text-sm text-[#737686]">Configure site-wide branding and server settings.</p>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Settings saved (UI preview — no backend persistence yet).
        </div>
      )}

      <div className="space-y-8">
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
              <Palette className="h-4 w-4 text-[#004AC6]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#121C28]">Site Branding</h3>
              <p className="text-xs text-[#737686]">The name and description shown across the platform.</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            <Input label="Site Description" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
            <Button type="submit"><Save className="mr-1.5 h-4 w-4" /> Save</Button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF]">
              <Mail className="h-4 w-4 text-[#004AC6]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#121C28]">Mail Server</h3>
              <p className="text-xs text-[#737686]">SMTP configuration for transactional emails.</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SMTP Host" value={mailHost} onChange={(e) => setMailHost(e.target.value)} placeholder="smtp.sendgrid.net" />
              <Input label="SMTP Port" value={mailPort} onChange={(e) => setMailPort(e.target.value)} placeholder="587" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SMTP Username" value={mailUser} onChange={(e) => setMailUser(e.target.value)} />
              <Input label="SMTP Password" type="password" value={mailPass} onChange={(e) => setMailPass(e.target.value)} />
            </div>
            <Button type="submit"><Save className="mr-1.5 h-4 w-4" /> Save</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
