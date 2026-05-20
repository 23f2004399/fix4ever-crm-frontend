import { useCRMStore } from "@/store";
import {
  useServiceRequests,
  useServiceRequest,
  useEscalateSR,
  useTagSR,
} from "../hooks";
import { ServiceRequestDetailModal } from "../components/ServiceRequestDetailModal";
import { ServiceRequestEditDrawer } from "../components/ServiceRequestEditDrawer";

// Exact enum from serviceRequest.model.ts — keep in sync with backend.
const SR_STATUSES = [
  "",
  "Pending",
  "Assigned",
  "In Progress",
  "Pending Verification",
  "Scheduled",
  "Pickup Requested",
  "Pickup Initiated",
  "Captain Reached Customer",
  "Pickup Done",
  "Captain Reached Vendor (Pickup)",
  "Handover to Vendor",
  "Device Received",
  "Problem Verification",
  "Problem Identification",
  "Identification Done",
  "Repair",
  "Repair Started",
  "Repair Done",
  "Admin Review Pending",
  "Customer Approval Pending",
  "Drop Requested",
  "Drop Initiated",
  "Captain Reached Vendor",
  "Handover to Captain",
  "Captain Pickup Done",
  "Device Delivered",
  "Arrived at Shop",
  "Completed",
  "Cancelled",
  "Expired",
];
const PRIORITIES = ["", "low", "medium", "high", "urgent"];

const STATUS_COLORS: Record<string, string> = {
  // Core
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "In Progress": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  Expired: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  // Scheduling
  "Pending Verification":
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Scheduled: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  // Pickup flow (captain)
  "Pickup Requested": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Pickup Initiated": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Captain Reached Customer": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Pickup Done": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Captain Reached Vendor (Pickup)":
    "bg-teal-400/10 text-teal-300 border-teal-400/20",
  "Handover to Vendor": "bg-teal-400/10 text-teal-300 border-teal-400/20",
  // Repair flow
  "Device Received": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Problem Verification":
    "bg-indigo-400/10 text-indigo-300 border-indigo-400/20",
  "Problem Identification":
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Identification Done":
    "bg-purple-400/10 text-purple-300 border-purple-400/20",
  Repair: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Repair Started": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Repair Done": "bg-violet-400/10 text-violet-300 border-violet-400/20",
  // Admin / approval
  "Admin Review Pending":
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Customer Approval Pending":
    "bg-amber-400/10 text-amber-300 border-amber-400/20",
  // Drop flow (captain)
  "Drop Requested": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Drop Initiated": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Captain Reached Vendor": "bg-sky-400/10 text-sky-300 border-sky-400/20",
  "Handover to Captain": "bg-sky-400/10 text-sky-300 border-sky-400/20",
  "Captain Pickup Done": "bg-sky-300/10 text-sky-300 border-sky-300/20",
  "Device Delivered":
    "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  // Visit-shop
  "Arrived at Shop": "bg-lime-500/10 text-lime-400 border-lime-500/20",
};

export function ServiceRequestsPage() {
  const {
    srFilters,
    srPage,
    setSRFilter,
    setSRPage,
    escalateModal,
    openEscalateModal,
    closeEscalateModal,
    setEscalateNote,
    viewDetailRequestId,
    openSRDetailModal,
    closeSRDetailModal,
    editSRId,
    openSREditDrawer,
    closeSREditDrawer,
  } = useCRMStore();

  const { data, isLoading } = useServiceRequests({
    status: srFilters.status || undefined,
    priority: srFilters.priority || undefined,
    search: srFilters.search || undefined,
    page: srPage,
    limit: 20,
  });

  const escalateMutation = useEscalateSR();
  const tagMutation = useTagSR();

  const { data: detailData, isLoading: detailLoading } = useServiceRequest(
    viewDetailRequestId ?? "",
  );
  const srDetail = detailData?.data;

  const requests = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Service Requests</h1>
        <p className="text-slate-400 text-sm mt-1">
          {pagination?.total.toLocaleString() ?? 0} total requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by ID, brand, model..."
          value={srFilters.search}
          onChange={(e) => setSRFilter("search", e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={srFilters.status}
          onChange={(e) => setSRFilter("status", e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
        >
          {SR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>
        <select
          value={srFilters.priority}
          onChange={(e) => setSRFilter("priority", e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p || "All priorities"}
            </option>
          ))}
        </select>
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
                  "Priority",
                  "Customer",
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
                    const customerName =
                      r.userName ??
                      customer?.username ??
                      customer?.email ??
                      "—";
                    return (
                      <tr
                        key={r._id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-blue-400 text-sm font-mono">
                          {r.request_id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-200 text-sm">
                            {r.deviceBrand ?? r.brand}{" "}
                            {r.deviceModel ?? r.model}
                          </p>
                          <p className="text-slate-500 text-xs capitalize">
                            {r.serviceType?.replace("-", " ")}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-lg border ${STATUS_COLORS[r.status] ?? "bg-slate-700 text-slate-400 border-slate-600"}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs capitalize ${
                              r.priority === "urgent"
                                ? "text-red-400"
                                : r.priority === "high"
                                  ? "text-amber-400"
                                  : "text-slate-400"
                            }`}
                          >
                            {r.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">
                          {customerName}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-sm">
                          {r.adminFinalPrice != null
                            ? `₹${r.adminFinalPrice}`
                            : r.paymentBreakdown?.totalCost != null
                              ? `₹${r.paymentBreakdown.totalCost}`
                              : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-sm">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              // Use business request ID so links/actions stay stable across environments.
                              onClick={() => openSRDetailModal(r.request_id)}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openSREditDrawer(r.request_id)}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openEscalateModal(r.request_id)}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                            >
                              Escalate
                            </button>
                            <button
                              onClick={() => {
                                const tag = prompt("Enter tag:");
                                if (tag)
                                  tagMutation.mutate({ id: r.request_id, tag });
                              }}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                            >
                              Tag
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setSRPage(srPage - 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setSRPage(srPage + 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View More detail modal */}
      {viewDetailRequestId && (
        <ServiceRequestDetailModal
          sr={srDetail}
          isLoading={detailLoading}
          onClose={closeSRDetailModal}
        />
      )}

      {/* Edit drawer */}
      {editSRId && (
        <ServiceRequestEditDrawer
          requestId={editSRId}
          onClose={closeSREditDrawer}
        />
      )}

      {/* Escalate modal */}
      {escalateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">
              Escalate Service Request
            </h3>
            <textarea
              value={escalateModal.note}
              onChange={(e) => setEscalateNote(e.target.value)}
              placeholder="Reason for escalation (min 5 chars)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none h-28"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={closeEscalateModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  escalateModal.note.length < 5 || escalateMutation.isPending
                }
                onClick={() =>
                  escalateMutation.mutate(
                    { id: escalateModal.requestId, note: escalateModal.note },
                    { onSuccess: closeEscalateModal },
                  )
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {escalateMutation.isPending ? "Escalating..." : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
