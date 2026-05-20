import { useState } from "react";
import {
  useCaptainSettlements,
  useApproveSettlement,
  useRejectSettlement,
} from "../hooks";
import { PermissionGate } from "@/shared/components/PermissionGate";
import type { CaptainSettlement } from "../types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-700/20 text-emerald-300 border-emerald-700/30",
  failed: "bg-red-800/20 text-red-300 border-red-700/30",
};

function RejectModal({
  settlement,
  onConfirm,
  onCancel,
  isPending,
}: {
  settlement: CaptainSettlement;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-white font-semibold">Reject Settlement</h3>
        <p className="text-slate-400 text-sm">
          Reject ₹{settlement.amount?.toLocaleString("en-IN")} withdrawal for{" "}
          {settlement.bankDetails?.accountHolderName}?
        </p>
        <textarea
          placeholder="Reason for rejection (required)…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm resize-none h-24 focus:outline-none focus:border-red-500"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || reason.trim().length < 3}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CaptainSettlementsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<CaptainSettlement | null>(
    null,
  );

  const { data, isLoading } = useCaptainSettlements({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const approve = useApproveSettlement();
  const reject = useRejectSettlement();

  const settlements: CaptainSettlement[] = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  return (
    <div className="space-y-6">
      {rejectTarget && (
        <RejectModal
          settlement={rejectTarget}
          isPending={reject.isPending}
          onConfirm={(reason) =>
            reject.mutate(
              { settlementId: rejectTarget._id, reason },
              { onSuccess: () => setRejectTarget(null) },
            )
          }
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Captain Settlements</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review and process captain withdrawal requests
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {["pending", "approved", "rejected", "completed", ""].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              statusFilter === s
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            Loading settlements…
          </div>
        ) : settlements.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            No settlement requests match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Captain
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Amount
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Bank
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Requested
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {settlements.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-300">
                      <p>{s.bankDetails?.accountHolderName ?? "—"}</p>
                      <p className="text-slate-500 text-xs">
                        {String(s.captainId)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      ₹{s.amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      <p>{s.bankDetails?.bankName}</p>
                      <p className="text-slate-500">
                        {s.bankDetails?.accountNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {s.requestedAt
                        ? new Date(s.requestedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[s.status] ?? ""}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGate permission="captains.settlements_approve">
                        {s.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approve.mutate(s._id)}
                              disabled={approve.isPending}
                              className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs rounded-lg border border-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(s)}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-500/20 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {s.rejectionReason && (
                          <p
                            className="text-slate-500 text-xs max-w-[160px] truncate"
                            title={s.rejectionReason}
                          >
                            {s.rejectionReason}
                          </p>
                        )}
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            Page {page} of {totalPages} · {pagination?.total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
