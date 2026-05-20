import { useState } from "react";
import {
  useFollowUpRules,
  useCreateFollowUpRule,
  useUpdateFollowUpRule,
  useDeleteFollowUpRule,
  useToggleFollowUpRule,
  useRunFollowUpRule,
} from "../hooks";
import type {
  FollowUpRule,
  FollowUpTrigger,
  FollowUpChannel,
  CreateFollowUpRulePayload,
} from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<FollowUpTrigger, string> = {
  service_completed: "After Service Completed",
  subscription_expiry: "Before Subscription Expires",
  subscription_renewed: "After Subscription Renewed",
};

const TRIGGER_DESC: Record<FollowUpTrigger, string> = {
  service_completed: "Sent X hours after a repair is marked Completed",
  subscription_expiry: "Sent X days before the subscription end date",
  subscription_renewed:
    "Sent X hours after a subscription becomes active again",
};

const TRIGGER_COLORS: Record<FollowUpTrigger, string> = {
  service_completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  subscription_expiry: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  subscription_renewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const CHANNEL_COLORS: Record<FollowUpChannel, string> = {
  email: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  sms: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  in_app: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  push: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const TRIGGERS: FollowUpTrigger[] = [
  "service_completed",
  "subscription_expiry",
  "subscription_renewed",
];

const CHANNELS: FollowUpChannel[] = ["email", "sms", "in_app", "push"];

const emptyForm: CreateFollowUpRulePayload = {
  name: "",
  trigger: "service_completed",
  delayHours: 24,
  channel: "email",
  targetCities: [],
  content: { body: "" },
};

const VARIABLE_CHIPS = [
  { token: "{{name}}", label: "Name" },
  { token: "{{city}}", label: "City" },
  { token: "{{deviceBrand}}", label: "Device Brand" },
  { token: "{{lastServiceType}}", label: "Service Type" },
  { token: "{{repairCount}}", label: "Repair Count" },
  { token: "{{subscriptionStatus}}", label: "Sub Status" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FollowUpsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<FollowUpRule | null>(null);
  const [form, setForm] = useState<CreateFollowUpRulePayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<FollowUpRule | null>(null);
  const [cityInput, setCityInput] = useState("");

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

  const { data, isLoading } = useFollowUpRules();
  const createMutation = useCreateFollowUpRule();
  const updateMutation = useUpdateFollowUpRule();
  const deleteMutation = useDeleteFollowUpRule();
  const toggleMutation = useToggleFollowUpRule();
  const runMutation = useRunFollowUpRule();

  const rules: FollowUpRule[] = (data?.data as FollowUpRule[]) ?? [];

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(r: FollowUpRule) {
    setEditTarget(r);
    setForm({
      name: r.name,
      description: r.description,
      trigger: r.trigger,
      delayHours: r.delayHours,
      daysBeforeExpiry: r.daysBeforeExpiry,
      channel: r.channel,
      targetCities: r.targetCities ? [...r.targetCities] : [],
      content: { ...r.content },
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Automated Follow-Ups
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Rules that trigger messages automatically after service or
            subscription events
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
          New Rule
        </button>
      </div>

      {/* How it works banner */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 grid sm:grid-cols-3 gap-4 text-sm">
        {TRIGGERS.map((t) => (
          <div key={t} className="flex gap-3">
            <div
              className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                t === "service_completed"
                  ? "bg-emerald-400"
                  : t === "subscription_expiry"
                    ? "bg-amber-400"
                    : "bg-blue-400"
              }`}
              style={{ marginTop: 6 }}
            />
            <div>
              <p className="text-slate-200 font-medium">{TRIGGER_LABELS[t]}</p>
              <p className="text-slate-500 text-xs mt-0.5">{TRIGGER_DESC[t]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl h-28 animate-pulse"
            />
          ))}
        </div>
      ) : rules.length === 0 ? (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>No follow-up rules yet</p>
          <button
            onClick={openCreate}
            className="mt-3 text-blue-400 text-sm hover:underline"
          >
            Create your first rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <div
              key={r._id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-colors ${
                r.isActive
                  ? "border-slate-800 hover:border-slate-700"
                  : "border-slate-800/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Toggle */}
                <button
                  onClick={() => toggleMutation.mutate(r._id)}
                  disabled={toggleMutation.isPending}
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                    r.isActive ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                  title={r.isActive ? "Disable rule" : "Enable rule"}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      r.isActive ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-medium text-sm">{r.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border ${TRIGGER_COLORS[r.trigger]}`}
                    >
                      {TRIGGER_LABELS[r.trigger]}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border capitalize ${CHANNEL_COLORS[r.channel]}`}
                    >
                      {r.channel.replace("_", " ")}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-slate-500 text-xs mt-1">
                      {r.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    {r.trigger === "subscription_expiry" ? (
                      <span>{r.daysBeforeExpiry ?? 3} days before expiry</span>
                    ) : (
                      <span>{r.delayHours}h after event</span>
                    )}
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 line-clamp-1 max-w-xs">
                      {r.content.body}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-center flex-shrink-0">
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 min-w-[60px]">
                    <p className="text-white text-sm font-semibold">
                      {r.stats.totalSent.toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">Sent</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 min-w-[60px]">
                    <p
                      className={`text-sm font-semibold ${r.stats.totalFailed > 0 ? "text-red-400" : "text-white"}`}
                    >
                      {r.stats.totalFailed.toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">Failed</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => runMutation.mutate(r._id)}
                    disabled={runMutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs border border-violet-500/20 transition-colors"
                    title="Run now (manual trigger)"
                  >
                    {runMutation.isPending ? "Running..." : "Run Now"}
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs border border-blue-500/20 transition-colors"
                    title="Edit rule"
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
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs border border-red-500/20 transition-colors"
                    title="Delete rule"
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
                </div>
              </div>

              {/* Last run info */}
              {r.stats.lastRunAt && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex gap-4 text-xs text-slate-600">
                  <span>
                    Last run: {new Date(r.stats.lastRunAt).toLocaleString()}
                  </span>
                  <span>
                    → sent {r.stats.lastRunSent ?? 0}, failed{" "}
                    {r.stats.lastRunFailed ?? 0}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <h3 className="text-white font-semibold mb-5">
              {editTarget ? "Edit Follow-Up Rule" : "New Follow-Up Rule"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Rule Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Post-Repair Thank You, Renewal Reminder..."
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
                  placeholder="Internal note about this rule..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Trigger *
                </label>
                <select
                  value={form.trigger}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trigger: e.target.value as FollowUpTrigger,
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                >
                  {TRIGGERS.map((t) => (
                    <option key={t} value={t}>
                      {TRIGGER_LABELS[t]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-600 mt-1">
                  {TRIGGER_DESC[form.trigger]}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {form.trigger === "subscription_expiry" ? (
                  <div>
                    <label className="text-xs text-slate-400 font-medium">
                      Days Before Expiry *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.daysBeforeExpiry ?? 3}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          daysBeforeExpiry: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-400 font-medium">
                      Delay (hours) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.delayHours}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          delayHours: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 font-medium">
                    Channel *
                  </label>
                  <select
                    value={form.channel}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        channel: e.target.value as FollowUpChannel,
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
              </div>

              {form.channel === "email" && (
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

              {/* City targeting */}
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Target Cities{" "}
                  <span className="text-slate-600 font-normal">(optional)</span>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400 font-medium">
                    Message Body *
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
                  placeholder="Hi {{name}}! We hope your repair went smoothly..."
                />
              </div>

              {form.channel === "email" && (
                <div>
                  <label className="text-xs text-slate-400 font-medium">
                    Call to Action label
                  </label>
                  <input
                    value={form.content.callToAction ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        content: {
                          ...form.content,
                          callToAction: e.target.value,
                        },
                      })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Leave a Review, Renew Now, Book Again..."
                  />
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
                disabled={!form.name || !form.content.body || isPending}
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {isPending
                  ? "Saving..."
                  : editTarget
                    ? "Save Changes"
                    : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Delete Rule?</h3>
            <p className="text-slate-400 text-sm mb-6">
              "<span className="text-white">{deleteTarget.name}</span>" will be
              permanently removed. No more follow-ups will be sent by this rule.
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
