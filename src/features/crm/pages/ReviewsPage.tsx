import { useState } from "react";
import { useCRMStore } from "@/store";
import {
  useReviews,
  useReviewAnalytics,
  useTeamMembers,
  useRespondToReview,
  useAssignReview,
  useUpdateReviewStatus,
} from "../hooks";
import type { Review, ReviewStatus } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-slate-700"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-slate-700/50 text-slate-400 border-slate-600",
  assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  responded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  resolved: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  flagged: "bg-red-500/10 text-red-400 border-red-500/20",
};

const RATING_COLOR = (r: number) =>
  r >= 4 ? "text-emerald-400" : r === 3 ? "text-amber-400" : "text-red-400";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReviewsPage() {
  const { reviewFilters, reviewPage, setReviewRatingFilter, setReviewPage } =
    useCRMStore();

  // Extra local filters (not in store — transient)
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [responseFilter, setResponseFilter] = useState<boolean | undefined>(
    undefined,
  );

  // Modal state
  const [respondTarget, setRespondTarget] = useState<Review | null>(null);
  const [respondText, setRespondText] = useState("");
  const [assignTarget, setAssignTarget] = useState<Review | null>(null);
  const [assignTo, setAssignTo] = useState("");

  const { data, isLoading } = useReviews({
    minRating: reviewFilters.minRating,
    maxRating: reviewFilters.maxRating,
    reviewStatus: statusFilter || undefined,
    hasResponse: responseFilter,
    page: reviewPage,
    limit: 20,
  });
  const { data: analytics } = useReviewAnalytics();
  const { data: teamData } = useTeamMembers();

  const respondMutation = useRespondToReview();
  const assignMutation = useAssignReview();
  const statusMutation = useUpdateReviewStatus();

  const reviews = data?.data ?? [];
  const pagination = data?.pagination;
  const agg = analytics?.data;
  const teamMembers = teamData?.data ?? [];

  async function handleRespond() {
    if (!respondTarget || !respondText.trim()) return;
    await respondMutation.mutateAsync({
      reviewId: respondTarget._id,
      text: respondText.trim(),
    });
    setRespondTarget(null);
    setRespondText("");
  }

  async function handleAssign() {
    if (!assignTarget || !assignTo) return;
    await assignMutation.mutateAsync({
      reviewId: assignTarget._id,
      assignedTo: assignTo,
    });
    setAssignTarget(null);
    setAssignTo("");
  }

  function quickStatus(review: Review, status: ReviewStatus) {
    statusMutation.mutate({ reviewId: review._id, status });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Reviews</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review monitoring, responses, and team assignment
        </p>
      </div>

      {/* Analytics summary */}
      {agg && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Avg Rating",
              value: Number(agg.overall?.avgRating ?? 0).toFixed(1) + " ★",
              color: "text-amber-400",
            },
            {
              label: "Total Reviews",
              value: (agg.overall?.total ?? 0).toLocaleString(),
              color: "text-white",
            },
            {
              label: "Avg Service Quality",
              value: Number(agg.overall?.avgServiceQuality ?? 0).toFixed(1),
              color: "text-white",
            },
            {
              label: "Avg Communication",
              value: Number(agg.overall?.avgCommunication ?? 0).toFixed(1),
              color: "text-white",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Rating distribution */}
      {agg?.ratingDistribution?.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 text-sm">
            Rating Distribution
          </h2>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const item = agg.ratingDistribution.find(
                (d: { _id: number; count: number }) => d._id === star,
              );
              const count = item?.count ?? 0;
              const total = agg.overall?.total ?? 1;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs w-6 text-right">
                    {star}★
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-500 text-xs w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Rating filter */}
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-slate-500 text-xs self-center">Rating:</span>
          {[undefined, 1, 2, 3, 4, 5].map((r) => (
            <button
              key={r ?? "all"}
              onClick={() => {
                setReviewRatingFilter(r);
                setReviewPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                reviewFilters.minRating === r
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              {r ? `${r}★` : "All"}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-slate-500 text-xs self-center">Status:</span>
          {(
            [
              "",
              "pending",
              "assigned",
              "responded",
              "resolved",
              "flagged",
            ] as const
          ).map((s) => (
            <button
              key={s || "all"}
              onClick={() => {
                setStatusFilter(s);
                setReviewPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs border capitalize transition-colors ${
                statusFilter === s
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {/* Response filter */}
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-slate-500 text-xs self-center">Response:</span>
          {[
            { label: "Any", value: undefined },
            { label: "Responded", value: true },
            { label: "Pending", value: false },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => {
                setResponseFilter(value);
                setReviewPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                responseFilter === value
                  ? "bg-violet-600/20 text-violet-400 border-violet-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse h-36"
            />
          ))
        ) : reviews.length === 0 ? (
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p>No reviews match your filters</p>
          </div>
        ) : (
          reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              onRespond={() => {
                setRespondTarget(r);
                setRespondText(r.crmResponse?.text ?? "");
              }}
              onAssign={() => {
                setAssignTarget(r);
                setAssignTo(
                  typeof r.assignedTo === "object" && r.assignedTo
                    ? r.assignedTo._id
                    : "",
                );
              }}
              onResolve={() => quickStatus(r, "resolved")}
              onFlag={() =>
                quickStatus(
                  r,
                  r.reviewStatus === "flagged" ? "pending" : "flagged",
                )
              }
              statusPending={statusMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setReviewPage(reviewPage - 1)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setReviewPage(reviewPage + 1)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-white font-semibold mb-1">Post Response</h3>
            <p className="text-slate-400 text-xs mb-4">
              Responding to{" "}
              <span className="text-white">
                {typeof respondTarget.customerId === "object" &&
                respondTarget.customerId
                  ? (respondTarget.customerId.username ??
                    respondTarget.customerId.email)
                  : "customer"}
              </span>
              's {respondTarget.rating}★ review
            </p>
            <textarea
              value={respondText}
              onChange={(e) => setRespondText(e.target.value)}
              maxLength={1000}
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Write a professional response to this customer's review..."
              autoFocus
            />
            <p className="text-xs text-slate-600 text-right mt-1">
              {respondText.length}/1000
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRespondTarget(null);
                  setRespondText("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!respondText.trim() || respondMutation.isPending}
                onClick={handleRespond}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {respondMutation.isPending ? "Posting..." : "Post Response"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-1">Assign Review</h3>
            <p className="text-slate-400 text-xs mb-4">
              Assign this {assignTarget.rating}★ review to a team member for
              follow-up.
            </p>
            <select
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">— select team member —</option>
              {teamMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username ?? m.email}
                </option>
              ))}
            </select>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setAssignTarget(null);
                  setAssignTo("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!assignTo || assignMutation.isPending}
                onClick={handleAssign}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review: r,
  onRespond,
  onAssign,
  onResolve,
  onFlag,
  statusPending,
}: {
  review: Review;
  onRespond: () => void;
  onAssign: () => void;
  onResolve: () => void;
  onFlag: () => void;
  statusPending: boolean;
}) {
  const [showResponse, setShowResponse] = useState(false);
  const customer = typeof r.customerId === "object" ? r.customerId : null;
  const vendor = typeof r.vendorId === "object" ? r.vendorId : null;
  const sr = typeof r.serviceRequestId === "object" ? r.serviceRequestId : null;
  const status: ReviewStatus = r.reviewStatus ?? "pending";

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-5 transition-colors ${
        r.flagged
          ? "border-red-500/30"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-4 flex-wrap">
        {/* Rating + comment */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Stars rating={r.rating} />
            <span className={`font-semibold text-sm ${RATING_COLOR(r.rating)}`}>
              {r.rating}/5
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-md border capitalize ${STATUS_STYLES[status]}`}
            >
              {status}
            </span>
            {r.flagged && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                Flagged
              </span>
            )}
            {r.wouldRecommend && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Recommends
              </span>
            )}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            {r.comment || "—"}
          </p>

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
            {customer && (
              <span>
                Customer:{" "}
                <span className="text-slate-400">
                  {customer.username ?? customer.email}
                </span>
              </span>
            )}
            {vendor?.pocInfo && (
              <span>
                Tech:{" "}
                <span className="text-slate-400">
                  {vendor.pocInfo.fullName}
                </span>
              </span>
            )}
            {sr && (
              <span>
                SR:{" "}
                <span className="text-slate-400">
                  {sr.request_id} ({sr.brand} {sr.model})
                </span>
              </span>
            )}
            {r.assignedTo && (
              <span>
                Assigned:{" "}
                <span className="text-blue-400">
                  {r.assignedTo.username ?? r.assignedTo.email}
                </span>
              </span>
            )}
            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Existing CRM response preview */}
          {r.crmResponse?.text && (
            <div className="mt-3">
              <button
                onClick={() => setShowResponse((v) => !v)}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${showResponse ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {showResponse ? "Hide response" : "View CRM response"}
              </button>
              {showResponse && (
                <div className="mt-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-sm text-slate-300 leading-relaxed">
                  {r.crmResponse.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sub-scores + actions */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Quality", val: r.serviceQuality },
              { label: "Comm.", val: r.communication },
              { label: "Punct.", val: r.punctuality },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800 rounded-lg p-1.5">
                <p className="text-amber-400 text-xs font-semibold">
                  {m.val ?? "—"}
                </p>
                <p className="text-slate-600 text-xs">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            <button
              onClick={onRespond}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs border border-emerald-500/20 transition-colors"
              title={r.crmResponse?.text ? "Edit response" : "Respond"}
            >
              {r.crmResponse?.text ? "Edit Reply" : "Respond"}
            </button>
            <button
              onClick={onAssign}
              className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs border border-blue-500/20 transition-colors"
              title="Assign to team member"
            >
              Assign
            </button>
            {status !== "resolved" && (
              <button
                onClick={onResolve}
                disabled={statusPending}
                className="px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 text-xs border border-violet-500/20 transition-colors disabled:opacity-40"
                title="Mark resolved"
              >
                Resolve
              </button>
            )}
            <button
              onClick={onFlag}
              disabled={statusPending}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-40 ${
                r.flagged
                  ? "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600"
                  : "bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/20"
              }`}
              title={r.flagged ? "Unflag" : "Flag for escalation"}
            >
              {r.flagged ? "Unflag" : "Flag"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
