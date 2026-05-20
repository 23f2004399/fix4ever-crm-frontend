import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { useCRMStore } from "@/store";
import {
  useCustomersInfinite,
  useBlockCustomer,
  useUnblockCustomer,
  useSegmentOverview,
} from "../hooks";
import type { SegmentOverview } from "../types";

const STATUS_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Active", value: true },
  { label: "Blocked", value: false },
];

type SegmentCategory = {
  label: string;
  color: string;
  segments: {
    label: string;
    key: keyof SegmentOverview;
    path: string;
  }[];
};

const SEGMENT_CATEGORIES: SegmentCategory[] = [
  {
    label: "Demographics",
    color: "blue",
    segments: [
      {
        label: "New This Month",
        key: "newThisMonth",
        path: "/crm/customers/segments/new_this_month",
      },
    ],
  },
  {
    label: "Service Usage",
    color: "purple",
    segments: [
      {
        label: "Returning",
        key: "returning",
        path: "/crm/customers/segments/returning",
      },
      {
        label: "High Usage",
        key: "highUsage",
        path: "/crm/customers/segments/high_usage",
      },
      {
        label: "Recent Active",
        key: "recentActive",
        path: "/crm/customers/segments/recent_active",
      },
    ],
  },
  {
    label: "Subscription Plans",
    color: "amber",
    segments: [
      {
        label: "Active Subscribers",
        key: "activeSubscribers",
        path: "/crm/customers/segments/active_subscribers",
      },
      {
        label: "Trial",
        key: "trial",
        path: "/crm/customers/segments/trial",
      },
      {
        label: "Expired",
        key: "expiredSubscription",
        path: "/crm/customers/segments/expired_subscription",
      },
      {
        label: "Cancelled",
        key: "cancelledSubscription",
        path: "/crm/customers/segments/cancelled_subscription",
      },
      {
        label: "No Subscription",
        key: "noSubscription",
        path: "/crm/customers/segments/no_subscription",
      },
    ],
  },
  {
    label: "Loyalty Levels",
    color: "emerald",
    segments: [
      {
        label: "High Value",
        key: "highValue",
        path: "/crm/customers/segments/high_value",
      },
      {
        label: "At Risk",
        key: "atRisk",
        path: "/crm/customers/segments/at_risk",
      },
      {
        label: "Wallet Active",
        key: "walletActive",
        path: "/crm/customers/segments/wallet_active",
      },
      {
        label: "Inactive",
        key: "inactive",
        path: "/crm/customers/segments/inactive",
      },
    ],
  },
];

const COLOR_MAP: Record<
  string,
  { badge: string; dot: string; header: string }
> = {
  blue: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
    header: "text-blue-400",
  },
  purple: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-500",
    header: "text-purple-400",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
    header: "text-amber-400",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
    header: "text-emerald-400",
  },
};

function SegmentPanel({
  overview,
  isLoading,
}: {
  overview?: SegmentOverview;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            Browse by Segment
          </span>
        </div>
        <Link
          to="/crm/customers"
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          All customers →
        </Link>
      </div>

      <div className="divide-y divide-slate-800">
        {SEGMENT_CATEGORIES.map((cat) => {
          const colors = COLOR_MAP[cat.color];
          const isOpen = open[cat.label] ?? false;

          return (
            <div key={cat.label}>
              <button
                onClick={() => toggle(cat.label)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  <span className={`text-sm font-medium ${colors.header}`}>
                    {cat.label}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown size={14} className="text-slate-500" />
                ) : (
                  <ChevronRight size={14} className="text-slate-500" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cat.segments.map((seg) => {
                    const count =
                      overview?.[seg.key] !== undefined
                        ? (overview[seg.key] as number)
                        : null;

                    return (
                      <Link
                        key={seg.key}
                        to={seg.path}
                        className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-colors group"
                      >
                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                          {seg.label}
                        </span>
                        {isLoading ? (
                          <div className="h-4 w-6 bg-slate-700 rounded animate-pulse" />
                        ) : count !== null ? (
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-md border ${colors.badge}`}
                          >
                            {count.toLocaleString()}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CustomersPage() {
  const { customerFilters, setCustomerSearch, setCustomerIsActive } =
    useCRMStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCustomersInfinite({
      search: customerFilters.search || undefined,
      isActive: customerFilters.isActive,
      limit: 20,
    });

  const { data: segmentData, isLoading: segmentLoading } = useSegmentOverview();

  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  const customers = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total.toLocaleString()} total customers
          </p>
        </div>
      </div>

      {/* Segment panel */}
      <SegmentPanel overview={segmentData?.data} isLoading={segmentLoading} />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={customerFilters.search}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="flex-1 min-w-[240px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <div className="flex rounded-xl border border-slate-700 overflow-hidden">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setCustomerIsActive(opt.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                customerFilters.isActive === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
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
                : customers.map((c) => (
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
                  ))}
            </tbody>
          </table>
        </div>

        {hasNextPage && (
          <div className="p-4 border-t border-slate-800 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm border border-slate-700 disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
