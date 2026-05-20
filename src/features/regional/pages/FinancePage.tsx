import { useState } from "react";
import { useRegionalFinance, useProfitability } from "../hooks";

export function FinancePage() {
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

  const { data: finance } = useRegionalFinance({
    from: dateRange.from,
    to: dateRange.to,
  });
  const { data: profitability } = useProfitability({
    from: dateRange.from,
    to: dateRange.to,
  });

  const f = finance?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Regional revenue, payments, and profitability
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

      {/* Summary Cards */}
      {f && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Revenue",
              value: `₹${(f.totalRevenue / 1000).toFixed(1)}K`,
              color: "text-emerald-400",
            },
            {
              label: "Pending Payments",
              value: f.pendingPayments,
              color: "text-amber-400",
            },
            {
              label: "Refunds",
              value: f.refunds?.count ?? 0,
              sub: `₹${(f.refunds?.total ?? 0).toLocaleString()}`,
              color: "text-red-400",
            },
            {
              label: "Revenue (30d avg/day)",
              value: f.dailyRevenue?.length
                ? `₹${Math.round(f.totalRevenue / Math.max(f.dailyRevenue.length, 1)).toLocaleString()}`
                : "—",
              color: "text-blue-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              {s.sub && <p className="text-slate-600 text-xs">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by Service Type */}
        {f?.revenueByServiceType?.length ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              Revenue by Service Type
            </h2>
            <div className="space-y-3">
              {f.revenueByServiceType.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm w-28 capitalize truncate">
                    {item._id ?? "Other"}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${f.totalRevenue ? (item.revenue / f.totalRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-slate-300 text-sm">
                    ₹{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Top Vendors by Revenue */}
        {f?.topVendorsByRevenue?.length ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              Top Vendors by Revenue
            </h2>
            <div className="space-y-3">
              {f.topVendorsByRevenue.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm truncate">
                      {v.vendorName ?? "—"}
                    </p>
                    <p className="text-slate-500 text-xs">{v.jobs} jobs</p>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">
                    ₹{v.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Profitability */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">
          Profitability Analysis
        </h2>
        {profitability?.data ? (
          <div className="space-y-3">
            {(
              profitability.data as {
                _id?: string;
                totalRevenue?: number;
                totalJobs?: number;
                avgOrderValue?: number;
              }[]
            )?.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
              >
                <span className="text-slate-300 text-sm">
                  {item._id ?? "—"}
                </span>
                <div className="flex gap-6 text-sm">
                  <span className="text-slate-500">{item.totalJobs} jobs</span>
                  <span className="text-slate-400">
                    Avg ₹{item.avgOrderValue?.toFixed(0)}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    ₹{(item.totalRevenue ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            No profitability data available
          </p>
        )}
      </div>

      {/* Daily Revenue Trend */}
      {f?.dailyRevenue?.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Daily Revenue Trend</h2>
          <div className="flex items-end gap-1 h-32">
            {f.dailyRevenue.map((day, i) => {
              const maxRev = Math.max(...f.dailyRevenue.map((d) => d.revenue));
              const height = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <div
                    className="w-full bg-blue-500/60 rounded-t-sm hover:bg-blue-400 transition-colors cursor-help"
                    style={{ height: `${height}%`, minHeight: 4 }}
                    title={`₹${day.revenue.toLocaleString()}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span>{new Date(dateRange.from).toLocaleDateString()}</span>
            <span>{new Date(dateRange.to).toLocaleDateString()}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
