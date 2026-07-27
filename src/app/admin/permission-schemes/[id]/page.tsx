"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetPermissionSchemeQuery,
  useUpdatePermissionSchemeMutation,
  type PermissionMapping,
} from "@/store/permissionApi";
import { PermissionSchemeEditor } from "@/components/admin/permission-scheme-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function PermissionSchemeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: scheme, isLoading } = useGetPermissionSchemeQuery(id);
  const [updateScheme, { isLoading: isUpdating }] = useUpdatePermissionSchemeMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mappings, setMappings] = useState<PermissionMapping[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (scheme && !initialized) {
    setName(scheme.name);
    setDescription(scheme.description || "");
    setMappings(scheme.mappings);
    setInitialized(true);
  }

  async function handleSave() {
    await updateScheme({
      id,
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      mappings,
    }).unwrap();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Shield className="mb-3 h-10 w-10 text-[#C3C6D7]" />
        <p className="text-sm text-[#737686]">Permission scheme not found</p>
        <Link href="/admin/permission-schemes" className="mt-4 text-sm font-medium text-[#2563EB]">
          &larr; Back to schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/admin" className="font-medium text-[#737686] hover:text-[#121C28] transition-colors">
          Administration
        </Link>
        <span className="text-[#C3C6D7]">/</span>
        <Link href="/admin/permission-schemes" className="font-medium text-[#737686] hover:text-[#121C28] transition-colors">
          Permission Schemes
        </Link>
        <span className="text-[#C3C6D7]">/</span>
        <span className="font-semibold text-[#121C28]">{scheme.name}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#121C28]">{scheme.name}</h1>
        <p className="mt-1 text-sm text-[#737686]">
          Configure which project roles have which permissions.
        </p>
      </div>

      <div className="mb-8 space-y-5 rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <Input label="Scheme name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <PermissionSchemeEditor
        mappings={mappings}
        availableRoles={[]}
        onChange={setMappings}
      />

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isUpdating}>Save Changes</Button>
        <Link href="/admin/permission-schemes">
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
