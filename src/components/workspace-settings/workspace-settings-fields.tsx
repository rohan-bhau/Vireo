"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetWorkspaceCustomFieldsQuery,
  useCreateCustomFieldMutation,
  useUpdateCustomFieldMutation,
  useDeleteCustomFieldMutation,
  type CustomField,
  type CustomFieldType,
} from "@/store/customFieldApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { GripVertical, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { clsx } from "clsx";

const SYSTEM_FIELDS: { name: string; type: string; description: string }[] = [
  { name: "Summary", type: "Text", description: "The issue title" },
  { name: "Description", type: "Textarea", description: "Rich detail about the issue" },
  { name: "Type", type: "Select", description: "Epic, Story, Task, Bug or Subtask" },
  { name: "Status", type: "Select", description: "Current workflow position" },
  { name: "Priority", type: "Select", description: "Importance of the issue" },
  { name: "Assignee", type: "User", description: "Who the issue is assigned to" },
  { name: "Reporter", type: "User", description: "Who created the issue" },
  { name: "Due date", type: "Date", description: "Deadline for the issue" },
  { name: "Labels", type: "Multi-select", description: "Free-form tags" },
  { name: "Story points", type: "Number", description: "Estimate of effort" },
];

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "TEXT", label: "Short text" },
  { value: "TEXTAREA", label: "Long text" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "SELECT", label: "Select one" },
  { value: "MULTISELECT", label: "Select multiple" },
];

const HAS_OPTIONS: CustomFieldType[] = ["SELECT", "MULTISELECT"];

export function WorkspaceSettingsFields() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { data: customFields = [], isLoading } = useGetWorkspaceCustomFieldsQuery(workspaceId);
  const [createField] = useCreateCustomFieldMutation();
  const [updateField] = useUpdateCustomFieldMutation();
  const [deleteField] = useDeleteCustomFieldMutation();

  const [editing, setEditing] = useState<CustomField | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CustomField | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState<CustomFieldType>("TEXT");
  const [draftOptions, setDraftOptions] = useState("");
  const [draftRequired, setDraftRequired] = useState(false);

  function openCreate() {
    setEditing(null);
    setDraftName("");
    setDraftType("TEXT");
    setDraftOptions("");
    setDraftRequired(false);
    setError(null);
    setShowDialog(true);
  }

  function openEdit(field: CustomField) {
    setEditing(field);
    setDraftName(field.name);
    setDraftType(field.type);
    setDraftOptions(field.options.join("\n"));
    setDraftRequired(field.required);
    setError(null);
    setShowDialog(true);
  }

  const hasOptions = useMemo(() => HAS_OPTIONS.includes(draftType), [draftType]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = draftName.trim();
    if (!name) {
      setError("Field name is required");
      return;
    }
    if (hasOptions) {
      const options = draftOptions.split("\n").map((o) => o.trim()).filter(Boolean);
      if (options.length === 0) {
        setError("Add at least one option");
        return;
      }
    }
    setBusy(true);
    const data = {
      name,
      type: draftType,
      options: hasOptions ? draftOptions.split("\n").map((o) => o.trim()).filter(Boolean) : [],
      required: draftRequired,
    };
    try {
      if (editing) {
        await updateField({ workspaceId, fieldId: editing._id, data }).unwrap();
        toastSuccess("Custom field updated");
      } else {
        await createField({ workspaceId, data }).unwrap();
        toastSuccess("Custom field created");
      }
      setShowDialog(false);
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message || "Could not save custom field");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteField({ workspaceId, fieldId: confirmDelete._id }).unwrap();
      toastSuccess("Custom field deleted");
      setConfirmDelete(null);
    } catch (err: unknown) {
      toastError((err as { data?: { message?: string } })?.data?.message || "Could not delete custom field");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Fields</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Standard fields are built into every issue. Add custom fields to capture workspace-specific data.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <div className="border-b border-border-light px-5 py-3">
          <h3 className="text-sm font-semibold text-text">System fields</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">Read-only — used across all issues.</p>
        </div>
        <ul className="divide-y divide-border-light">
          {SYSTEM_FIELDS.map((field) => (
            <li key={field.name} className="flex items-center gap-3 px-5 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-text-tertiary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{field.name}</p>
                <p className="truncate text-xs text-text-tertiary">{field.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-bg-light px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
                {field.type}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-light bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Custom fields</h3>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Shown on the Create Issue modal and issue details. Managed per workspace.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Add custom field
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && customFields.length === 0 && (
          <div className="px-5 py-4">
            <EmptyState
              icon={<Plus className="h-8 w-8" />}
              title="No custom fields"
              message="Define bespoke fields to capture workspace-specific data."
              action={
                <Button onClick={openCreate}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add custom field
                </Button>
              }
            />
          </div>
        )}

        {!isLoading && customFields.length > 0 && (
          <ul className="divide-y divide-border-light">
            {customFields.map((field) => (
              <li key={field._id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <GripVertical className="h-4 w-4 shrink-0 text-text-tertiary" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-text">
                    {field.name}
                    {field.required && (
                      <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
                        Required
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                    {FIELD_TYPES.find((t) => t.value === field.type)?.label && field.options.length > 0 && " · "}
                    {field.options.length > 0 && `${field.options.length} option${field.options.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(field)}
                    className="flex h-7 w-7 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-bg-light hover:text-text"
                    title="Edit field"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(field)}
                    className="flex h-7 w-7 items-center justify-center rounded-[3px] text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                    title="Delete field"
                  >
                    {confirmDelete?._id === field._id && busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit custom field" : "Add custom field"} className="max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Name"
            value={draftName}
            onChange={(e) => { setDraftName(e.target.value); setError(null); }}
            placeholder="e.g. Client, Region, Effort estimate"
            error={error || undefined}
            autoFocus
          />
          <div>
            <label className="text-xs font-semibold text-text-secondary">Field type</label>
            <select
              value={draftType}
              onChange={(e) => { setDraftType(e.target.value as CustomFieldType); setError(null); }}
              className="mt-1.5 w-full rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {hasOptions && (
            <div>
              <label className="text-xs font-semibold text-text-secondary">
                Options (one per line)
              </label>
              <textarea
                value={draftOptions}
                onChange={(e) => setDraftOptions(e.target.value)}
                rows={4}
                placeholder={`High\nMedium\nLow`}
                className="mt-1.5 w-full rounded-[3px] border border-border-light bg-surface px-3 py-2 text-sm text-text placeholder:text-text-placeholder focus:border-primary focus:outline-none"
              />
            </div>
          )}
          <label className={clsx("flex items-center justify-between rounded-lg border px-4 py-3", draftRequired ? "border-primary bg-primary-bg/40" : "border-border-light")}>
            <div>
              <p className="text-sm font-medium text-text">Required field</p>
              <p className="text-xs text-text-tertiary">Issues must have a value for this field.</p>
            </div>
            <Switch checked={draftRequired} onChange={setDraftRequired} aria-label="Required field" />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="submit" isLoading={busy}>{editing ? "Save changes" : "Add field"}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete custom field" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Delete <strong className="text-text">{confirmDelete?.name}</strong>? Existing values on issues
            will be removed too. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" isLoading={busy} onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}