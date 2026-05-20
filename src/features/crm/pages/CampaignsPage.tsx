import { useState } from "react";
import { useCRMStore } from "@/store";
import {
  useCampaigns,
  useCreateCampaign,
  useActivateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useRestartCampaign,
  useCampaignTemplates,
  useBroadcastNotification,
} from "../hooks";
import type {
  CampaignType,
  CampaignSegment,
  CreateCampaignPayload,
  Campaign,
  CampaignTemplate,
} from "../types";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-700 text-slate-400 border-slate-600",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const SEGMENTS: { value: CampaignSegment; label: string; group: string }[] = [
  { value: "all", label: "All Customers", group: "General" },
  {
    value: "active_subscribers",
    label: "Active Subscribers",
    group: "Subscription",
  },
  {
    value: "trial",
    label: "Trial Users",
    group: "Subscription",
  } as unknown as { value: CampaignSegment; label: string; group: string },
  {
    value: "expired_subscription",
    label: "Expired Subscription",
    group: "Subscription",
  } as unknown as { value: CampaignSegment; label: string; group: string },
  {
    value: "no_subscription",
    label: "No Subscription",
    group: "Subscription",
  } as unknown as { value: CampaignSegment; label: string; group: string },
  { value: "inactive", label: "Inactive", group: "Engagement" },
  { value: "new_this_month", label: "New This Month", group: "Demographics" },
  { value: "high_value", label: "High Value (top 500)", group: "Loyalty" },
  { value: "regional", label: "Regional", group: "Location" },
  { value: "custom", label: "Custom User IDs", group: "Custom" },
  {
    value: "repeat_customers",
    label: "Repeat Customers (2+ repairs)",
    group: "Behavior",
  },
  {
    value: "new_customers",
    label: "New Customers (1st repair)",
    group: "Behavior",
  },
  { value: "device_laptop", label: "Laptop Owners", group: "Behavior" },
  { value: "device_mobile", label: "Mobile Owners", group: "Behavior" },
  { value: "high_spenders", label: "High Spenders (₹5k+)", group: "Behavior" },
  { value: "onsite_users", label: "Onsite Service Users", group: "Behavior" },
  { value: "pickup_drop_users", label: "Pickup-Drop Users", group: "Behavior" },
];

const VARIABLE_CHIPS = [
  { token: "{{name}}", label: "Name" },
  { token: "{{city}}", label: "City" },
  { token: "{{deviceBrand}}", label: "Device Brand" },
  { token: "{{lastServiceType}}", label: "Service Type" },
  { token: "{{repairCount}}", label: "Repair Count" },
  { token: "{{subscriptionStatus}}", label: "Sub Status" },
];

const emptyForm: CreateCampaignPayload = {
  title: "",
  type: "email",
  targetSegment: "all",
  content: { body: "" },
};

const emptyNotify = { title: "", message: "", targetSegment: "all" };

type ModalMode = "create" | "edit" | "none";

export function CampaignsPage() {
  const { campaignStatusFilter, setCampaignStatusFilter } = useCRMStore();

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>("none");
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CreateCampaignPayload>(emptyForm);

  // Quick Notify
  const [showNotify, setShowNotify] = useState(false);
  const [notifyForm, setNotifyForm] = useState(emptyNotify);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);

  const { data, isLoading } = useCampaigns({
    status: campaignStatusFilter || undefined,
  });
  const { data: templatesData } = useCampaignTemplates(form.type);

  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const activateMutation = useActivateCampaign();
  const deleteMutation = useDeleteCampaign();
  const restartMutation = useRestartCampaign();
  const notifyMutation = useBroadcastNotification();

  const campaigns = data?.data ?? [];
  const templates = (templatesData?.data as CampaignTemplate[]) ?? [];

  function openCreate() {
    setForm(emptyForm);
    setEditTarget(null);
    setModalMode("create");
  }

  function openEdit(c: Campaign) {
    setEditTarget(c);
    setForm({
      title: c.title,
      type: c.type,
      targetSegment: c.targetSegment,
      targetCities: c.targetCities ? [...c.targetCities] : [],
      content: { ...c.content },
      scheduledAt: c.scheduledAt,
    });
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode("none");
    setEditTarget(null);
    setForm(emptyForm);
  }

  function applyTemplate(t: CampaignTemplate) {
    setForm((f) => ({
      ...f,
      content: {
        subject: t.subject ?? f.content.subject,
        body: t.body,
        callToAction: t.callToAction ?? f.content.callToAction,
      },
    }));
  }

  async function handleCreate() {
    await createMutation.mutateAsync(form);
    closeModal();
  }

  async function handleEdit() {
    if (!editTarget) return;
    await updateMutation.mutateAsync({ id: editTarget._id, updates: form });
    closeModal();
  }

  async function handleNotify() {
    await notifyMutation.mutateAsync({
      title: notifyForm.title,
      message: notifyForm.message,
      type: "promotional",
      targetSegment: notifyForm.targetSegment,
    });
    setShowNotify(false);
    setNotifyForm(emptyNotify);
  }

  const canEdit = (c: Campaign) =>
    ["draft", "paused", "scheduled"].includes(c.status);
  const canDelete = (c: Campaign) =>
    ["draft", "paused", "cancelled", "completed"].includes(c.status);
  const canRestart = (c: Campaign) =>
    ["completed", "paused", "cancelled"].includes(c.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 text-sm mt-1">
            Marketing automation & outreach
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNotify(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Quick Notify
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Campaign
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          "",
          "draft",
          "scheduled",
          "active",
          "paused",
          "completed",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setCampaignStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
              campaignStatusFilter === s
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-52 animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <p>No campaigns found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-medium text-sm leading-tight line-clamp-2">
                  {c.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border flex-shrink-0 ${STATUS_COLORS[c.status] ?? ""}`}
                >
                  {c.status}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 capitalize">
                  {c.type}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 capitalize">
                  {c.targetSegment?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Sent", value: c.stats.sent },
                  { label: "Opened", value: c.stats.opened },
                  { label: "Failed", value: c.stats.failed },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-white text-sm font-semibold">
                      {value.toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 mt-auto flex-wrap">
                {c.status === "draft" && c.approvalStatus === "approved" && (
                  <button
                    onClick={() => activateMutation.mutate(c._id)}
                    disabled={activateMutation.isPending}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs border border-emerald-500/20 transition-colors"
                  >
                    Activate
                  </button>
                )}
                {canEdit(c) && (
                  <button
                    onClick={() => openEdit(c)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs border border-blue-500/20 transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                {canRestart(c) && (
                  <button
                    onClick={() => restartMutation.mutate(c._id)}
                    disabled={restartMutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-xs border border-amber-500/20 transition-colors"
                    title="Restart (reset to draft)"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                )}
                {canDelete(c) && (
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs border border-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
                <span className="text-xs text-slate-600 self-center ml-auto">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode !== "none" && (
        <CampaignFormModal
          mode={modalMode}
          form={form}
          templates={templates}
          setForm={setForm}
          onClose={closeModal}
          onApplyTemplate={applyTemplate}
          onSubmit={modalMode === "create" ? handleCreate : handleEdit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Quick Notify Modal */}
      {showNotify && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-1">
              Quick Notification
            </h3>
            <p className="text-slate-400 text-xs mb-5">
              Send an in-app notification to a customer segment instantly.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Title *
                </label>
                <input
                  value={notifyForm.title}
                  onChange={(e) =>
                    setNotifyForm({ ...notifyForm, title: e.target.value })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-violet-500"
                  placeholder="Notification title..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Message *
                </label>
                <textarea
                  value={notifyForm.message}
                  onChange={(e) =>
                    setNotifyForm({ ...notifyForm, message: e.target.value })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-violet-500 resize-none h-24"
                  placeholder="Notification message..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Segment
                </label>
                <select
                  value={notifyForm.targetSegment}
                  onChange={(e) =>
                    setNotifyForm({
                      ...notifyForm,
                      targetSegment: e.target.value,
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-violet-500"
                >
                  {SEGMENTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNotify(false);
                  setNotifyForm(emptyNotify);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  !notifyForm.title ||
                  !notifyForm.message ||
                  notifyMutation.isPending
                }
                onClick={handleNotify}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {notifyMutation.isPending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Delete Campaign?</h3>
            <p className="text-slate-400 text-sm mb-6">
              "<span className="text-white">{deleteTarget.title}</span>" will be
              permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={async () => {
                  await deleteMutation.mutateAsync(deleteTarget._id);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Campaign Form Modal ───────────────────────────────────────────────────────

function CampaignFormModal({
  mode,
  form,
  templates,
  setForm,
  onClose,
  onApplyTemplate,
  onSubmit,
  isPending,
}: {
  mode: "create" | "edit";
  form: CreateCampaignPayload;
  templates: CampaignTemplate[];
  setForm: React.Dispatch<React.SetStateAction<CreateCampaignPayload>>;
  onClose: () => void;
  onApplyTemplate: (t: CampaignTemplate) => void;
  onSubmit: () => Promise<void>;
  isPending: boolean;
}) {
  const [cityInput, setCityInput] = useState("");
  const channelTemplates = templates.filter((t) => t.channel === form.type);

  function addCity(raw: string) {
    const city = raw.trim();
    if (!city) return;
    const existing = form.targetCities ?? [];
    if (!existing.includes(city)) {
      setForm({ ...form, targetCities: [...existing, city] });
    }
    setCityInput("");
  }

  function removeCity(city: string) {
    setForm({
      ...form,
      targetCities: (form.targetCities ?? []).filter((c) => c !== city),
    });
  }

  function insertVariable(token: string) {
    setForm({
      ...form,
      content: { ...form.content, body: form.content.body + token },
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <h3 className="text-white font-semibold mb-5">
          {mode === "create" ? "Create Campaign" : "Edit Campaign"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Campaign title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as CampaignType })
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
              >
                {(["email", "sms", "in_app", "push"] as CampaignType[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">
                Segment *
              </label>
              <select
                value={form.targetSegment}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetSegment: e.target.value as CampaignSegment,
                  })
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    [{s.group}] {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City targeting */}
          <div>
            <label className="text-xs text-slate-400 font-medium">
              Target Cities{" "}
              <span className="text-slate-600 font-normal">
                (optional — leave empty for all)
              </span>
            </label>
            <div className="mt-1 flex flex-wrap gap-1.5 min-h-[2.5rem] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              {(form.targetCities ?? []).map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() => removeCity(city)}
                    className="text-blue-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addCity(cityInput);
                  }
                }}
                onBlur={() => addCity(cityInput)}
                className="flex-1 min-w-[120px] bg-transparent text-slate-200 text-sm focus:outline-none placeholder:text-slate-600"
                placeholder="Type city + Enter..."
              />
            </div>
          </div>

          {/* Template picker */}
          {channelTemplates.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 font-medium">
                Load Template
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const t = channelTemplates.find(
                    (x) => x._id === e.target.value,
                  );
                  if (t) onApplyTemplate(t);
                }}
                className="w-full mt-1 bg-slate-800 border border-amber-500/30 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">— pick a template —</option>
                {channelTemplates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.type === "email" && (
            <div>
              <label className="text-xs text-slate-400 font-medium">
                Email Subject
              </label>
              <input
                value={form.content.subject ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: { ...form.content, subject: e.target.value },
                  })
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Email subject line..."
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400 font-medium">
                Message Body *
              </label>
              <span className="text-xs text-slate-600">Insert variable:</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {VARIABLE_CHIPS.map(({ token, label }) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertVariable(token)}
                  className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors font-mono"
                  title={token}
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              value={form.content.body}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: { ...form.content, body: e.target.value },
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-32 font-mono"
              placeholder="Campaign message body... use {{name}}, {{city}}, etc."
            />
          </div>

          {form.type === "email" && (
            <div>
              <label className="text-xs text-slate-400 font-medium">
                Call to Action button label
              </label>
              <input
                value={form.content.callToAction ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: { ...form.content, callToAction: e.target.value },
                  })
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. Book Now, Claim Offer..."
              />
            </div>
          )}

          {mode === "create" && (
            <div>
              <label className="text-xs text-slate-400 font-medium">
                Schedule (optional)
              </label>
              <input
                type="datetime-local"
                onChange={(e) =>
                  setForm({
                    ...form,
                    scheduledAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={!form.title || !form.content.body || isPending}
            onClick={onSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Create"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
