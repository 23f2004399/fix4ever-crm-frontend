import { useGrowthOpportunities, useRegionalBenchmark } from "../hooks";

export function StrategicPage() {
  const { data: growth, isLoading: loadingGrowth } = useGrowthOpportunities();
  const { data: benchmark, isLoading: loadingBenchmark } =
    useRegionalBenchmark();

  const g = growth?.data;
  const b = benchmark?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Strategic Insights</h1>
        <p className="text-slate-400 text-sm mt-1">
          Growth opportunities and KPI benchmarking
        </p>
      </div>

      {/* Growth Opportunities */}
      {loadingGrowth ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse h-48" />
      ) : g ? (
        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Unserved Requests",
                value: g.unservedRequests,
                color: "text-red-400",
              },
              {
                label: "Approved Vendors",
                value: g.technicianGap?.approvedVendors,
                color: "text-blue-400",
              },
              {
                label: "Active Jobs",
                value: g.technicianGap?.activeJobs,
                color: "text-amber-400",
              },
              {
                label: "Supply/Demand Ratio",
                value: g.technicianGap?.supplyDemandRatio,
                color: "text-violet-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
              >
                <p className={`text-2xl font-bold ${s.color}`}>
                  {s.value ?? "—"}
                </p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          {g.insights?.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">
                AI-Driven Insights
              </h2>
              <div className="space-y-2">
                {g.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Demand Areas */}
            {g.topDemandAreas?.length ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">
                  Top Demand Areas
                </h2>
                <div className="space-y-2">
                  {g.topDemandAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                        {i + 1}
                      </div>
                      <span className="flex-1 text-slate-300 text-sm">
                        {area._id ?? "Unknown area"}
                      </span>
                      <span className="text-blue-400 font-medium text-sm">
                        {area.demand} requests
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Category Opportunities */}
            {g.categoryOpportunities?.length ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">
                  Category Opportunities
                </h2>
                <div className="space-y-3">
                  {g.categoryOpportunities.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="flex-1 text-slate-300 text-sm capitalize">
                        {cat._id ?? "Unknown"}
                      </span>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-red-500 h-1.5 rounded-full"
                          style={{ width: `${cat.incompletionRate ?? 0}%` }}
                        />
                      </div>
                      <span className="text-red-400 text-xs w-12 text-right">
                        {cat.incompletionRate?.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Incompletion rate (lower is better)
                </p>
              </div>
            ) : null}
          </div>

          {/* Staffing Alert */}
          {g.technicianGap?.isUnderstaffed && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-red-400 text-sm font-medium">
                Region is understaffed! Consider onboarding more technicians to
                meet demand.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* KPI Benchmark */}
      {loadingBenchmark ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse h-48" />
      ) : b ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">
            KPI Benchmark vs Platform Average
            <span className="ml-2 text-xs text-slate-500 font-normal">
              ({b.region})
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Your Region
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Platform Avg
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Total SRs",
                    regional: b.regional?.totalSR,
                    platform: b.platform?.totalSR,
                    format: (v: number) => v?.toLocaleString(),
                  },
                  {
                    label: "Completion Rate",
                    regional: b.regional?.completionRate,
                    platform: b.platform?.completionRate,
                    format: (v: string) => v,
                  },
                  {
                    label: "Cancellation Rate",
                    regional: b.regional?.cancellationRate,
                    platform: b.platform?.cancellationRate,
                    format: (v: string) => v,
                  },
                  {
                    label: "Total Revenue",
                    regional: b.regional?.totalRevenue,
                    platform: b.platform?.totalRevenue,
                    format: (v: number) => `₹${v?.toLocaleString()}`,
                  },
                  {
                    label: "Avg Order Value",
                    regional: b.regional?.avgOrderValue,
                    platform: b.platform?.avgOrderValue,
                    format: (v: number) => `₹${v?.toFixed(0)}`,
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-white text-sm text-right font-medium">
                      {row.format(row.regional as never)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm text-right">
                      {row.format(row.platform as never)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {row.label === "Completion Rate" &&
                        b.comparison?.completionRateVsPlatform && (
                          <span
                            className={
                              b.comparison.completionRateVsPlatform.startsWith(
                                "+",
                              )
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {b.comparison.completionRateVsPlatform}
                          </span>
                        )}
                      {row.label === "Total Revenue" &&
                        b.comparison?.revenuePlatformShare && (
                          <span className="text-slate-500 text-xs">
                            {b.comparison.revenuePlatformShare} of platform
                          </span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
