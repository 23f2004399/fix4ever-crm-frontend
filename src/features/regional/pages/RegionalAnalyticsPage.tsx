import { useState } from "react";
import {
  useRegionalAnalytics,
  useResourcePlanning,
  useLoyaltyInsights,
  useCustomerInsights,
} from "../hooks";

export function RegionalAnalyticsPage() {
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const [dateRange, setDateRange] = useState({
    from: monthStart,
    to: now.toISOString(),
  });

  const { data: analytics } = useRegionalAnalytics({
    from: dateRange.from,
    to: dateRange.to,
  });
  const { data: resources } = useResourcePlanning();
  const { data: loyalty } = useLoyaltyInsights();
  const { data: customers } = useCustomerInsights({ limit: 10 });

  const a = analytics?.data;
  const r = resources?.data;
  const l = loyalty?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Regional Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Operational insights and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="datetime-local"
            defaultValue={monthStart.slice(0, 16)}
            onChange={(e) =>
              setDateRange((d) => ({
                ...d,
                from: new Date(e.target.value).toISOString(),
              }))
            }
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none"
          />
          <input
            type="datetime-local"
            defaultValue={now.toISOString().slice(0, 16)}
            onChange={(e) =>
              setDateRange((d) => ({
                ...d,
                to: new Date(e.target.value).toISOString(),
              }))
            }
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Service Stats */}
      {a && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(a.serviceStats ?? []).slice(0, 4).map((s) => (
            <div
              key={s._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center"
            >
              <p className="text-2xl font-bold text-white">
                {s.count.toLocaleString()}
              </p>
              <p className="text-slate-500 text-sm mt-1 capitalize">
                {s._id?.replace(/_/g, " ") ?? "Other"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by service type */}
        {a?.serviceByType?.length ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              Revenue by Service Type
            </h2>
            <div className="space-y-3">
              {a.serviceByType.map((s) => {
                const total = a.totalRevenue || 1;
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm w-28 capitalize truncate">
                      {s._id ?? "Other"}
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(s.revenue / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-sm">
                      ₹{s.revenue.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Top Technicians */}
        {a?.topTechnicians?.length ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Top Technicians</h2>
            <div className="space-y-3">
              {a.topTechnicians.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm truncate">
                      {t.vendorName ?? "—"}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {t.completedJobs} jobs · ★ {t.vendorRating?.toFixed(1)}
                    </p>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">
                    ₹{(t.revenue ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Resolution Time + Resource Planning */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Resolution Time</h2>
          {a?.resolutionTime ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                {
                  label: "Average",
                  value: `${a.resolutionTime.avgResolutionHours.toFixed(1)}h`,
                },
                {
                  label: "Fastest",
                  value: `${a.resolutionTime.minResolutionHours.toFixed(1)}h`,
                },
                {
                  label: "Slowest",
                  value: `${a.resolutionTime.maxResolutionHours.toFixed(1)}h`,
                },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No resolution time data</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Resource Planning</h2>
          {r ? (
            <div className="space-y-3">
              {[
                { label: "Total Vendors", value: r.capacity?.totalVendors },
                {
                  label: "Approved Vendors",
                  value: r.capacity?.approvedVendors,
                },
                {
                  label: "Overloaded Vendors",
                  value: r.capacity?.overloadedVendors,
                },
                { label: "Active Jobs", value: r.activeJobs },
                { label: "Utilization Rate", value: r.utilizationRate },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-1.5 border-b border-slate-800 last:border-0"
                >
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-white font-medium text-sm">
                    {item.value ?? "—"}
                  </span>
                </div>
              ))}
              {r.recommendation && (
                <div className="mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-xs">{r.recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Loading...</p>
          )}
        </div>
      </div>

      {/* Loyalty Insights + Top Customers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Loyalty Insights</h2>
          {l ? (
            <div className="space-y-3">
              {[
                {
                  label: "Unique Customers",
                  value: l.totalUniqueCustomers?.toLocaleString(),
                },
                { label: "Active Subscribers", value: l.activeSubscribers },
                {
                  label: "Subscription Rate",
                  value: l.subscriptionAdoptionRate,
                },
                { label: "Wallet Holders", value: l.walletHolders },
                { label: "Wallet Adoption", value: l.walletAdoptionRate },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-1.5 border-b border-slate-800 last:border-0"
                >
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-white font-medium text-sm">
                    {item.value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Loading...</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">
            Top Customers (by order count)
          </h2>
          {customers?.data?.length ? (
            <div className="space-y-2">
              {customers.data.slice(0, 8).map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm truncate">
                      {c.customer?.username ?? c.customer?.email ?? "—"}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {c.completed}/{c.orderCount} completed
                    </p>
                  </div>
                  <span className="text-emerald-400 text-sm">
                    ₹{(c.totalSpent ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No customer data</p>
          )}
        </div>
      </div>
    </div>
  );
}
