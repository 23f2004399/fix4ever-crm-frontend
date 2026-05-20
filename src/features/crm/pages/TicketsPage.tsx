import { useState } from "react";
import { useCRMStore } from "@/store";
import {
  useTickets,
  useCreateTicket,
  useResolveTicket,
  useCompensateTicket,
} from "../hooks";
import type { TicketCategory, TicketPriority } from "../types";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-700 text-slate-400 border-slate-600",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  assigned: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  escalated: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-slate-700 text-slate-500 border-slate-600",
};

type CreateForm = {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
};

const defaultForm: CreateForm = {
  title: "",
  description: "",
  category: "other",
  priority: "medium",
};

export function TicketsPage() {
  const { ticketFilters, ticketPage, setTicketFilter, setTicketPage } =
    useCRMStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(defaultForm);
  const [resolveState, setResolveState] = useState<{
    id: string;
    note: string;
  } | null>(null);
  const [compensateState, setCompensateState] = useState<{
    id: string;
    customerId: string;
    amount: string;
    reason: string;
  } | null>(null);

  const { data, isLoading } = useTickets({
    status: ticketFilters.status || undefined,
    priority: ticketFilters.priority || undefined,
    page: ticketPage,
    limit: 20,
  });

  const createMutation = useCreateTicket();
  const resolveMutation = useResolveTicket();
  const compensateMutation = useCompensateTicket();

  const tickets = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination?.total ?? 0} total tickets
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          + New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={ticketFilters.status}
          onChange={(e) => setTicketFilter("status", e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
        >
          {[
            "",
            "open",
            "assigned",
            "in_progress",
            "escalated",
            "resolved",
            "closed",
          ].map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>
        <select
          value={ticketFilters.priority}
          onChange={(e) => setTicketFilter("priority", e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
        >
          {["", "low", "medium", "high", "critical"].map((p) => (
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
                  "Ticket",
                  "Category",
                  "Priority",
                  "Status",
                  "Created",
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
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : tickets.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-slate-200 text-sm font-medium">
                          {t.title}
                        </p>
                        <p className="text-slate-500 text-xs font-mono">
                          {t.ticketId}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm capitalize">
                        {t.category?.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border ${PRIORITY_COLORS[t.priority] ?? ""}`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border ${STATUS_COLORS[t.status] ?? ""}`}
                        >
                          {t.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {["open", "in_progress", "escalated"].includes(
                            t.status,
                          ) && (
                            <button
                              onClick={() =>
                                setResolveState({ id: t._id, note: "" })
                              }
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setCompensateState({
                                id: t._id,
                                customerId: "",
                                amount: "",
                                reason: "",
                              })
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                          >
                            Compensate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                onClick={() => setTicketPage(ticketPage - 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setTicketPage(ticketPage + 1)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-5">Create Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as TicketCategory,
                      })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
                  >
                    {[
                      "payment_issue",
                      "service_quality",
                      "technician_complaint",
                      "app_issue",
                      "refund_request",
                      "account_issue",
                      "other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as TicketPriority,
                      })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
                  >
                    {["low", "medium", "high", "critical"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setForm(defaultForm);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  !form.title || !form.description || createMutation.isPending
                }
                onClick={() =>
                  createMutation.mutate(form, {
                    onSuccess: () => {
                      setShowCreate(false);
                      setForm(defaultForm);
                    },
                  })
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveState && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Resolve Ticket</h3>
            <textarea
              value={resolveState.note}
              onChange={(e) =>
                setResolveState({ ...resolveState, note: e.target.value })
              }
              placeholder="Resolution note (min 10 chars)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setResolveState(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  resolveState.note.length < 10 || resolveMutation.isPending
                }
                onClick={() =>
                  resolveMutation.mutate(
                    { id: resolveState.id, note: resolveState.note },
                    { onSuccess: () => setResolveState(null) },
                  )
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {resolveMutation.isPending ? "Resolving..." : "Mark Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compensate Modal */}
      {compensateState && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">
              Issue Wallet Compensation
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Customer ID *</label>
                <input
                  value={compensateState.customerId}
                  onChange={(e) =>
                    setCompensateState({
                      ...compensateState,
                      customerId: e.target.value,
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Customer ObjectId"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Amount (₹) *</label>
                <input
                  type="number"
                  value={compensateState.amount}
                  onChange={(e) =>
                    setCompensateState({
                      ...compensateState,
                      amount: e.target.value,
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason *</label>
                <textarea
                  value={compensateState.reason}
                  onChange={(e) =>
                    setCompensateState({
                      ...compensateState,
                      reason: e.target.value,
                    })
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                  placeholder="Compensation reason (min 10 chars)..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCompensateState(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={
                  !compensateState.customerId ||
                  !compensateState.amount ||
                  compensateState.reason.length < 10 ||
                  compensateMutation.isPending
                }
                onClick={() =>
                  compensateMutation.mutate(
                    {
                      id: compensateState.id,
                      payload: {
                        customerId: compensateState.customerId,
                        amount: Number(compensateState.amount),
                        reason: compensateState.reason,
                      },
                    },
                    { onSuccess: () => setCompensateState(null) },
                  )
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {compensateMutation.isPending
                  ? "Processing..."
                  : "Issue Compensation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
