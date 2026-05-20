import { useRegionalStore } from "@/store";
import {
  useRegionalServiceRequests,
  useAssignSR,
  useReassignSR,
  useCancelSR,
} from "../hooks";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "In Progress": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  Escalated: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function RegionalServiceRequestsPage() {
  const {
    srFilters,
    srPage,
    setSRFilter,
    setSRPage,
    assignModal,
    reassignModal,
    cancelModal,
    openAssignModal,
    closeAssignModal,
    openReassignModal,
    closeReassignModal,
    setReassignData,
    openCancelModal,
    closeCancelModal,
    setCancelReason,
  } = useRegionalStore();

  const { data, isLoading } = useRegionalServiceRequests({
    status: srFilters.status || undefined,
    page: srPage,
    limit: 20,
  });
  const assignMutation = useAssignSR();
  const reassignMutation = useReassignSR();
  const cancelMutation = useCancelSR();

  const requests = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Service Requests</h1>
        <p className="text-slate-400 text-sm mt-1">
          {pagination?.total.toLocaleString() ?? 0} regional requests
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          "",
          "Pending",
          "Assigned",
          "In Progress",
          "Completed",
          "Cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setSRFilter("status", s)}
            className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition-colors ${
              srFilters.status === s
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  "Request ID",
                  "Device",
                  "Status",
                  "Customer",
                  "Assigned To",
                  "Amount",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : requests.map((r) => {
                    const customer =
                      typeof r.customerId === "object" && r.customerId
                        ? r.customerId
                        : null;
                    const vendor =
                      typeof r.assignedVendor === "object" && r.assignedVendor
                        ? r.assignedVendor
                        : null;
                    const isActive = !["Completed", "Cancelled"].includes(
                      r.status,
                    );
                    return (
                      <tr
                        key={r._id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-3 text-blue-400 text-sm font-mono">
                          {r.request_id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-200 text-sm">
                            {r.brand} {r.model}
                          </p>
                          <p className="text-slate-500 text-xs capitalize">
                            {r.serviceType?.replace("-", " ")}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md border ${STATUS_COLORS[r.status] ?? "bg-slate-700 text-slate-400 border-slate-600"}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">
                          {customer?.username ?? customer?.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">
                          {vendor?.pocInfo?.fullName ?? "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {r.adminFinalPrice ? `₹${r.adminFinalPrice}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-sm">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {isActive && (
                            <div className="flex gap-1.5">
                              {r.status === "Pending" && (
                                <button
                                  onClick={() => openAssignModal(r._id)}
                                  className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                                >
                                  Assign
                                </button>
                              )}
                              {r.status === "Assigned" && (
                                <button
                                  onClick={() => openReassignModal(r._id)}
                                  className="text-xs px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20"
                                >
                                  Reassign
                                </button>
                              )}
                              <button
                                onClick={() => openCancelModal(r._id)}
                                className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setSRPage(srPage - 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setSRPage(srPage + 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">
              Assign Service Request
            </h3>
            <div>
              <label className="text-xs text-slate-400">
                Technician (Vendor ID) *
              </label>
              <input
                id="vendorId"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                placeholder="MongoDB ObjectId of vendor..."
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={closeAssignModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const vendorId = (
                    document.getElementById("vendorId") as HTMLInputElement
                  )?.value;
                  if (vendorId)
                    assignMutation.mutate(
                      { id: assignModal.requestId, payload: { vendorId } },
                      { onSuccess: closeAssignModal },
                    );
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {reassignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">
              Reassign Service Request
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">
                  New Technician ID *
                </label>
                <input
                  value={reassignModal.vendorId}
                  onChange={(e) =>
                    setReassignData(e.target.value, reassignModal.reason)
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason *</label>
                <textarea
                  value={reassignModal.reason}
                  onChange={(e) =>
                    setReassignData(reassignModal.vendorId, e.target.value)
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                  placeholder="Reason for reassignment (min 10 chars)..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={closeReassignModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  !reassignModal.vendorId ||
                  reassignModal.reason.length < 10 ||
                  reassignMutation.isPending
                }
                onClick={() =>
                  reassignMutation.mutate(
                    {
                      id: reassignModal.requestId,
                      payload: {
                        vendorId: reassignModal.vendorId,
                        reason: reassignModal.reason,
                      },
                    },
                    { onSuccess: closeReassignModal },
                  )
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {reassignMutation.isPending ? "Reassigning..." : "Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">
              Cancel Service Request
            </h3>
            <div>
              <label className="text-xs text-slate-400">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                placeholder="Reason for cancellation (min 10 chars)..."
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  cancelModal.reason.length < 10 || cancelMutation.isPending
                }
                onClick={() =>
                  cancelMutation.mutate(
                    {
                      id: cancelModal.requestId,
                      payload: { reason: cancelModal.reason },
                    },
                    { onSuccess: closeCancelModal },
                  )
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
