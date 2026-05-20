import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCustomerSegment,
  useBlockCustomer,
  useUnblockCustomer,
} from "../hooks";
import type { CustomerSegment } from "../types";

const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  new_this_month: "New This Month",
  returning: "Returning Customers",
  high_usage: "High Usage",
  recent_active: "Recent Active",
  active_subscribers: "Active Subscribers",
  trial: "Trial",
  expired_subscription: "Expired Subscription",
  cancelled_subscription: "Cancelled Subscription",
  no_subscription: "No Subscription",
  high_value: "High Value",
  at_risk: "At Risk",
  wallet_active: "Wallet Active",
  inactive: "Inactive",
};

const SEGMENT_DESCRIPTIONS: Partial<Record<CustomerSegment, string>> = {
  new_this_month: "Customers who joined in the current calendar month",
  returning: "Customers with 2 or more completed service requests",
  high_usage: "Customers with 5 or more service requests",
  recent_active: "Customers with a service request in the last 30 days",
  active_subscribers: "Customers on an active subscription plan",
  trial: "Customers on a trial subscription",
  expired_subscription: "Customers whose subscription has expired",
  cancelled_subscription: "Customers who cancelled their subscription",
  no_subscription: "Customers with no subscription history",
  high_value: "Top customers by wallet balance",
  at_risk: "Customers inactive for 45–90 days",
  wallet_active: "Customers with a positive wallet balance",
  inactive: "Customers with no activity in 90+ days",
};

const PAGE_SIZE = 20;

export function CustomerSegmentPage() {
  const { segment } = useParams<{ segment: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useCustomerSegment(segment ?? "", {
    page,
    limit: PAGE_SIZE,
  });

  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  const customers = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const label =
    SEGMENT_LABELS[segment as CustomerSegment] ?? segment ?? "Segment";
  const description = SEGMENT_DESCRIPTIONS[segment as CustomerSegment];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to="/crm/customers"
          className="mt-1 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{label}</h1>
          {description && (
            <p className="text-slate-400 text-sm mt-1">{description}</p>
          )}
          {!isLoading && (
            <p className="text-slate-500 text-xs mt-1">
              {total.toLocaleString()} customer{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  "Customer",
                  "Email",
                  "Phone",
                  "Status",
                  "Joined",
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
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500 text-sm"
                  >
                    No customers in this segment
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold flex-shrink-0">
                          {(c.username ?? c.email)[0].toUpperCase()}
                        </div>
                        <span className="text-slate-200 text-sm font-medium">
                          {c.username ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-lg border ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {c.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/crm/customers/${c._id}`}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          View
                        </Link>
                        {c.isActive ? (
                          <button
                            onClick={() => {
                              const reason = prompt("Block reason:");
                              if (reason)
                                blockMutation.mutate({ id: c._id, reason });
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => unblockMutation.mutate(c._id)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} &bull;{" "}
              {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–
              {Math.min(page * PAGE_SIZE, total).toLocaleString()} of{" "}
              {total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1 || isFetching}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || isFetching}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
