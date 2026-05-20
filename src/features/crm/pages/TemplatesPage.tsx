import { useState } from "react";
import {
  useCampaignTemplates,
  useCreateCampaignTemplate,
  useUpdateCampaignTemplate,
  useDeleteCampaignTemplate,
} from "../hooks";
import type {
  CampaignTemplate,
  CampaignType,
  CreateCampaignTemplatePayload,
} from "../types";

const CHANNEL_COLORS: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  sms: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_app: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  push: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const CHANNELS: CampaignType[] = ["email", "sms", "in_app", "push"];

const VARIABLE_CHIPS = [
  { token: "{{name}}", label: "Name" },
  { token: "{{city}}", label: "City" },
  { token: "{{deviceBrand}}", label: "Device Brand" },
  { token: "{{lastServiceType}}", label: "Service Type" },
  { token: "{{repairCount}}", label: "Repair Count" },
  { token: "{{subscriptionStatus}}", label: "Sub Status" },
];

const emptyForm: CreateCampaignTemplatePayload = {
  name: "",
  channel: "email",
  body: "",
};

export function TemplatesPage() {
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CampaignTemplate | null>(null);
  const [form, setForm] = useState<CreateCampaignTemplatePayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<CampaignTemplate | null>(
    null,
  );
  const [preview, setPreview] = useState<CampaignTemplate | null>(null);

  const { data, isLoading } = useCampaignTemplates(channelFilter || undefined);
  const createMutation = useCreateCampaignTemplate();
  const updateMutation = useUpdateCampaignTemplate();
  const deleteMutation = useDeleteCampaignTemplate();

  const templates: CampaignTemplate[] =
    (data?.data as CampaignTemplate[]) ?? [];

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(t: CampaignTemplate) {
    setEditTarget(t);
    setForm({
      name: t.name,
      description: t.description,
      channel: t.channel,
      subject: t.subject,
      body: t.body,
      callToAction: t.callToAction,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTarget(null);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget._id, updates: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    closeForm();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign Templates</h1>
          <p className="text-slate-400 text-sm mt-1">
            Reusable content for emails, SMS, and in-app messages
          </p>
        </div>
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
          New Template
        </button>
      </div>

      {/* Channel filter */}
      <div className="flex gap-2 flex-wrap">
        {["", ...CHANNELS].map((c) => (
          <button
            key={c}
            onClick={() => setChannelFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
              channelFilter === c
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            {c ? c.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {/* Email template explanation */}
      {(channelFilter === "email" || channelFilter === "") && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-slate-300">
          <p className="font-medium text-blue-400 mb-1">
            How Email Templates Work
          </p>
          <p className="text-slate-400 leading-relaxed">
            Email templates define the{" "}
            <strong className="text-slate-300">subject line</strong>,{" "}
            <strong className="text-slate-300">body text</strong>, and an
            optional{" "}
            <strong className="text-slate-300">call-to-action button</strong>.
            The body is wrapped automatically in Fix4Ever's branded email frame
            (dark header, white card, footer). When creating a campaign, pick a
            template to pre-fill the content — you can still edit it before
            sending. Use{" "}
            <code className="bg-slate-800 px-1 rounded text-xs">
              {"{{username}}"}
            </code>{" "}
            style variables for personalisation (future).
          </p>
        </div>
      )}

      {/* Template grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No templates yet</p>
          <button
            onClick={openCreate}
            className="mt-3 text-blue-400 text-sm hover:underline"
          >
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-white font-medium text-sm">{t.name}</h3>
                  {t.description && (
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
                      {t.description}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border flex-shrink-0 capitalize ${CHANNEL_COLORS[t.channel] ?? ""}`}
                >
                  {t.channel.replace("_", " ")}
                </span>
              </div>

              {t.subject && (
                <p className="text-slate-400 text-xs">
                  <span className="text-slate-600">Subject: </span>
                  {t.subject}
                </p>
              )}

              <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                {t.body}
              </p>

              {t.callToAction && (
                <div className="inline-block">
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-md border border-blue-500/20">
                    CTA: {t.callToAction}
                  </span>
                </div>
              )}

              <div className="flex gap-1.5 mt-auto pt-2 border-t border-slate-800">
                {t.channel === "email" && (
                  <button
                    onClick={() => setPreview(t)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs border border-slate-700 transition-colors"
                  >
                    Preview
                  </button>
                )}
                <button
                  onClick={() => openEdit(t)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs border border-blue-500/20 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs border border-red-500/20 transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <h3 className="text-white font-semibold mb-5">
              {editTarget ? "Edit Template" : "New Template"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Template Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Monthly Newsletter, Festive Offer..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Description
                </label>
                <input
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Short description of when to use this..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Channel *
                </label>
                <select
                  value={form.channel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      channel: e.target.value as CampaignType,
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              {form.channel === "email" && (
                <div>
                  <label className="text-xs text-slate-400 font-medium">
                    Email Subject
                  </label>
                  <input
                    value={form.subject ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Email subject line..."
                  />
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400 font-medium">
                    Body *
                    {form.channel === "sms" && (
                      <span className="ml-1 text-slate-600">
                        (max 160 chars)
                      </span>
                    )}
                  </label>
                  <span className="text-xs text-slate-600">
                    Insert variable:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {VARIABLE_CHIPS.map(({ token, label }) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, body: form.body + token })
                      }
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors font-mono"
                      title={token}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-36 font-mono"
                  placeholder={
                    form.channel === "email"
                      ? "Hi {{name}}, your repair is complete! Visit us again in {{city}}..."
                      : form.channel === "sms"
                        ? "Hi {{name}}! Your Fix4Ever repair is done. (160 chars max)"
                        : "Hi {{name}}! Tap to see your repair update..."
                  }
                  maxLength={form.channel === "sms" ? 160 : undefined}
                />
                {form.channel === "sms" && (
                  <p className="text-xs text-slate-600 mt-1 text-right">
                    {form.body.length}/160
                  </p>
                )}
              </div>
              {form.channel === "email" && (
                <div>
                  <label className="text-xs text-slate-400 font-medium">
                    Call to Action button label
                  </label>
                  <input
                    value={form.callToAction ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, callToAction: e.target.value })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Book Now, Claim Your Offer, Learn More..."
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Renders as a blue button linking to fix4ever.com
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeForm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!form.name || !form.body || isPending}
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {isPending
                  ? "Saving..."
                  : editTarget
                    ? "Save Changes"
                    : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Delete Template?</h3>
            <p className="text-slate-400 text-sm mb-6">
              "<span className="text-white">{deleteTarget.name}</span>" will be
              permanently removed. Existing campaigns using this template are
              unaffected.
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

      {/* Email Preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-semibold text-gray-800 text-sm">
                Email Preview — {preview.name}
              </span>
              <button
                onClick={() => setPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div style={{ backgroundColor: "#f1f5f9", padding: "32px 16px" }}>
              <div
                style={{
                  maxWidth: 520,
                  margin: "0 auto",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg,#0f172a,#1e293b)",
                    padding: "24px 32px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
                    Fix4Ever
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    Premium Device Care
                  </div>
                  {preview.subject && (
                    <div
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 600,
                        marginTop: 12,
                      }}
                    >
                      {preview.subject}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: "28px 32px",
                    color: "#334155",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{preview.body}</div>
                  {preview.callToAction && (
                    <div style={{ marginTop: 24, textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#1e40af",
                          color: "#fff",
                          padding: "10px 24px",
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {preview.callToAction}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "16px 32px",
                    borderTop: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                    © {new Date().getFullYear()} Fix4Ever. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
