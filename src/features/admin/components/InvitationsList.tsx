/**
 * Invitations List
 *
 * Admin table of invitations with status filter, resend, and cancel actions.
 * Uses React Query for server state; invalidates cache after mutations.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchInvitations, cancelInvitation, resendInvitation } from "../api";
import { getErrorMessage } from "@/shared/utils/error";
import type { InvitationStatus } from "../api";
import { ROLE_LABELS, ROLE_COLORS } from "../types";

/** Tailwind classes for each invitation status badge */
const STATUS_STYLES: Record<InvitationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  expired: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

/** Formats ISO date string for display (e.g. "Mar 19, 2025, 2:30 PM") */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function InvitationsList() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "">("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-invitations", statusFilter || "all"],
    queryFn: () => fetchInvitations(1, 50, statusFilter || undefined),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success("Invitation cancelled");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to cancel"));
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendInvitation,
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      try {
        await navigator.clipboard.writeText(data.inviteLink);
        toast.success("New link copied to clipboard");
      } catch {
        toast.success("New link generated (copy manually from URL)");
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to resend"));
    },
  });

  const invitations = data?.invitations ?? [];
  const total = data?.pagination?.total ?? 0;

  if (isLoading) {
    return (
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/80 p-12">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading invitations…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/80 p-12 text-center">
        <p className="text-slate-400 mb-4">Failed to load invitations</p>
        <button
          onClick={() => refetch()}
          className="btn-primary py-2 px-4 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-500 text-sm">Filter:</span>
        {(["", "pending", "accepted", "expired", "cancelled"] as const).map(
          (s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {s || "All"}
            </button>
          ),
        )}
        <span className="ml-auto text-slate-500 text-sm">{total} total</span>
      </div>

      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/80 overflow-hidden">
        {invitations.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-700/50 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">
              {statusFilter
                ? `No ${statusFilter} invitations`
                : "No invitations yet"}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Create an invitation to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{inv.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {inv.roles.map((r) => (
                      <span
                        key={r}
                        className={`text-xs px-2 py-0.5 rounded-lg font-medium border ${ROLE_COLORS[r]}`}
                      >
                        {ROLE_LABELS[r]}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    Invited by {inv.invitedByName ?? inv.invitedBy ?? "Admin"} ·{" "}
                    {formatDate(inv.createdAt)}
                    {inv.expiresAt && inv.status === "pending" && (
                      <> · Expires {formatDate(inv.expiresAt)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border capitalize ${STATUS_STYLES[inv.status]}`}
                  >
                    {inv.status}
                  </span>
                  {inv.status === "pending" && (
                    <>
                      <button
                        onClick={() => resendMutation.mutate(inv.id)}
                        disabled={resendMutation.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 disabled:opacity-50"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate(inv.id)}
                        disabled={cancelMutation.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
