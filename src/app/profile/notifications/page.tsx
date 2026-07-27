"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { NotificationPreferencesForm } from "@/components/notifications/preferences-form";
import { Bell } from "lucide-react";

export default function NotificationPreferencesPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF4FF]">
              <Bell className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-[#121C28]">Notification Preferences</h1>
              <p className="mt-0.5 text-sm text-[#737686]">
                Configure how and when you receive notifications
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <NotificationPreferencesForm />
        </div>
      </div>
    </AppLayout>
  );
}
