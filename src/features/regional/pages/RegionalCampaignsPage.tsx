import { useState } from "react";
import { useRegionalStore } from "@/store";
import { useRegionalCampaigns, useReviewCampaign } from "../hooks";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-700 text-slate-400 border-slate-600",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const APPROVAL_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function RegionalCampaignsPage() {
  const { campaignStatusFilter, setCampaignStatusFilter } = useRegionalStore();
  const [reviewModal, setReviewModal] = useState<{
    id: string;
    action: "approve" | "reject";
    reason: string;
  } | null>(null);

  const { data, isLoading } = useRegionalCampaigns({
    status: campaignStatusFilter || undefined,
  });
  const reviewMutation = useReviewCampaign();

  const campaigns = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Campaign Oversight</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review and approve marketing campaigns for your region
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "draft", "scheduled", "active", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setCampaignStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition-colors ${
              campaignStatusFilter === s
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Campaign list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No campaigns for this region</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-medium text-sm">
                      {c.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border ${STATUS_COLORS[c.status] ?? ""}`}
                    >
                      {c.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border ${APPROVAL_COLORS[c.approvalStatus] ?? ""}`}
                    >
                      {c.approvalStatus}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="capitalize">{c.type}</span>
                    <span className="capitalize">
                      {c.targetSegment?.replace("_", " ")}
                    </span>
                    {c.targetRegion && <span>Region: {c.targetRegion}</span>}
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-slate-400">
                      Sent: <span className="text-white">{c.stats.sent}</span>
                    </span>
                    <span className="text-slate-400">
                      Delivered:{" "}
                      <span className="text-white">{c.stats.delivered}</span>
                    </span>
                    <span className="text-slate-400">
                      Opened:{" "}
                      <span className="text-white">{c.stats.opened}</span>
                    </span>
                    <span className="text-slate-400">
                      Converted:{" "}
                      <span className="text-white">{c.stats.converted}</span>
                    </span>
                  </div>
                </div>

                {/* Approval actions */}
                {c.approvalStatus === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        setReviewModal({
                          id: c._id,
                          action: "approve",
                          reason: "",
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        setReviewModal({
                          id: c._id,
                          action: "reject",
                          reason: "",
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">
              {reviewModal.action === "approve"
                ? "Approve Campaign"
                : "Reject Campaign"}
            </h3>
            {reviewModal.action === "reject" && (
              <div className="mb-4">
                <label className="text-xs text-slate-400">
                  Rejection Reason *
                </label>
                <textarea
                  value={reviewModal.reason}
                  onChange={(e) =>
                    setReviewModal({ ...reviewModal, reason: e.target.value })
                  }
                  placeholder="Explain why this campaign is being rejected..."
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                />
              </div>
            )}
            {reviewModal.action === "approve" && (
              <p className="text-slate-400 text-sm mb-4">
                This campaign will be approved and marked ready for activation.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  (reviewModal.action === "reject" && !reviewModal.reason) ||
                  reviewMutation.isPending
                }
                onClick={() =>
                  reviewMutation.mutate(
                    {
                      id: reviewModal.id,
                      payload: {
                        action: reviewModal.action,
                        rejectionReason: reviewModal.reason || undefined,
                      },
                    },
                    { onSuccess: () => setReviewModal(null) },
                  )
                }
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 ${
                  reviewModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {reviewMutation.isPending
                  ? "Processing..."
                  : reviewModal.action === "approve"
                    ? "Approve"
                    : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
