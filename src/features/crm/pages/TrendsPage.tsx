import { useState, useMemo } from "react";
import { useSRTrends } from "../hooks";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: decimals });
}

function pct(n: number) {
  return `${fmt(n, 1)}%`;
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "blue" | "emerald" | "amber" | "red" | "violet";
}) {
  const ring: Record<string, string> = {
    blue: "border-blue-500/20 bg-blue-500/5",
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    red: "border-red-500/20 bg-red-500/5",
    violet: "border-violet-500/20 bg-violet-500/5",
  };
  const text: Record<string, string> = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    violet: "text-violet-400",
  };
  return (
    <div className={`rounded-2xl border p-5 ${ring[accent]}`}>
      <p className="text-slate-500 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${text[accent]}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function HBar({
  label,
  value,
  max,
  sub,
  color = "bg-blue-500",
}: {
  label: string;
  value: number;
  max: number;
  sub?: string;
  color?: string;
}) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-300 text-sm w-36 truncate shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-slate-400 text-sm w-10 text-right shrink-0">
        {fmt(value)}
      </span>
      {sub && (
        <span className="text-slate-600 text-xs w-12 text-right shrink-0">
          {sub}
        </span>
      )}
    </div>
  );
}

// Pure-CSS mini bar chart — one column per day
function DailyChart({
  data,
}: {
  data: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
  }>;
}) {
  if (!data.length) return <p className="text-slate-600 text-sm">No data</p>;

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="flex items-end gap-1 h-32 overflow-x-auto pb-1">
      {data.map((d) => {
        const heightPct = max > 0 ? (d.count / max) * 100 : 0;
        const label = `${d._id.day}/${d._id.month}`;
        return (
          <div
            key={label}
            className="group flex flex-col items-center gap-0.5 shrink-0"
            style={{ minWidth: 20 }}
          >
            <div className="relative flex-1 flex items-end w-full">
              {/* Tooltip */}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-700 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                {label}: {d.count}
              </span>
              <div
                className="w-full bg-blue-500/70 hover:bg-blue-400 rounded-t transition-colors"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-600 rotate-45 origin-left mt-1">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Severity badge for recurring issues ─────────────────────────────────────

function SeverityBadge({
  count,
  cancellationRate,
}: {
  count: number;
  cancellationRate: number;
}) {
  if (cancellationRate >= 40 || count >= 15) {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
        High
      </span>
    );
  }
  if (cancellationRate >= 20 || count >= 7) {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
        Medium
      </span>
    );
  }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
      Watch
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export function TrendsPage() {
  const [preset, setPreset] = useState(30);
  const [from, setFrom] = useState(() => toISODate(daysAgo(30)));
  const [to, setTo] = useState(() => toISODate(new Date()));

  // Sync preset → date inputs
  function applyPreset(days: number) {
    setPreset(days);
    setFrom(toISODate(daysAgo(days)));
    setTo(toISODate(new Date()));
  }

  const { data, isLoading } = useSRTrends({
    from: new Date(from).toISOString(),
    to: new Date(to + "T23:59:59").toISOString(),
  });

  const trends = data?.data;

  // ─── Derived summary stats ─────────────────────────────────────────────────

  const summary = useMemo(() => {
    if (!trends) return null;

    const total = trends.statusBreakdown.reduce(
      (s: number, x: { count: number }) => s + x.count,
      0,
    );
    const completed =
      trends.statusBreakdown.find((x: { _id: string }) => x._id === "Completed")
        ?.count ?? 0;
    const cancelled =
      trends.statusBreakdown.find((x: { _id: string }) => x._id === "Cancelled")
        ?.count ?? 0;

    const days = trends.dailyVolume.length || 1;
    const avgDaily = total / days;

    return {
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      avgDaily,
    };
  }, [trends]);

  const statusMax = useMemo(
    () =>
      Math.max(
        ...(trends?.statusBreakdown ?? []).map(
          (x: { count: number }) => x.count,
        ),
        1,
      ),
    [trends],
  );

  const brandMax = useMemo(
    () =>
      Math.max(
        ...(trends?.topBrands ?? []).map((x: { count: number }) => x.count),
        1,
      ),
    [trends],
  );

  const cityMax = useMemo(
    () =>
      Math.max(
        ...(trends?.topCities ?? []).map((x: { count: number }) => x.count),
        1,
      ),
    [trends],
  );

  const problemMax = useMemo(
    () =>
      Math.max(
        ...(trends?.topProblems ?? []).map((x: { count: number }) => x.count),
        1,
      ),
    [trends],
  );

  const STATUS_COLORS: Record<string, string> = {
    Completed: "bg-emerald-500",
    Cancelled: "bg-red-500",
    Pending: "bg-amber-500",
    Assigned: "bg-blue-500",
    "In Progress": "bg-violet-500",
    Escalated: "bg-orange-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          SR Trends & Recurring Issues
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Identify patterns, problem hotspots, and recurring device issues.
        </p>
      </div>

      {/* Date controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => applyPreset(p.days)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                preset === p.days
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPreset(0);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-600 text-sm">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPreset(0);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : !trends ? (
        <p className="text-slate-500">Failed to load trend data.</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Requests"
              value={fmt(summary!.total)}
              sub={`${fmt(summary!.avgDaily, 1)} avg/day`}
              accent="blue"
            />
            <StatCard
              label="Completion Rate"
              value={pct(summary!.completionRate)}
              sub="of all requests"
              accent="emerald"
            />
            <StatCard
              label="Cancellation Rate"
              value={pct(summary!.cancellationRate)}
              sub="of all requests"
              accent={summary!.cancellationRate > 20 ? "red" : "amber"}
            />
            <StatCard
              label="Recurring Issues"
              value={trends.recurringIssues.length}
              sub="brand+problem combos ≥3"
              accent="violet"
            />
          </div>

          {/* Daily volume chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Daily Volume</h2>
            <DailyChart data={trends.dailyVolume} />
          </div>

          {/* Row: Status + Service Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">
                Status Distribution
              </h2>
              <div className="space-y-3">
                {trends.statusBreakdown.map(
                  (s: { _id: string; count: number }) => (
                    <HBar
                      key={s._id}
                      label={s._id}
                      value={s.count}
                      max={statusMax}
                      color={STATUS_COLORS[s._id] ?? "bg-slate-500"}
                    />
                  ),
                )}
              </div>
            </div>

            {/* Service type completion */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">
                Service Type Breakdown
              </h2>
              <div className="space-y-4">
                {trends.completionRateByServiceType.map(
                  (s: {
                    _id: string;
                    total: number;
                    completed: number;
                    cancelled: number;
                    completionRate: number;
                    avgPrice: number;
                  }) => (
                    <div key={s._id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300 capitalize">
                          {s._id?.replace(/-/g, " ") ?? "—"}
                        </span>
                        <span className="text-slate-500">
                          {fmt(s.total)} requests · ₹{fmt(s.avgPrice ?? 0)} avg
                        </span>
                      </div>
                      <div className="flex gap-1 h-2">
                        {/* completed portion */}
                        <div
                          className="h-full bg-emerald-500 rounded-l"
                          style={{ width: `${s.completionRate}%` }}
                          title={`Completed: ${pct(s.completionRate)}`}
                        />
                        {/* cancelled portion */}
                        <div
                          className="h-full bg-red-500/70"
                          style={{
                            width: `${s.total > 0 ? (s.cancelled / s.total) * 100 : 0}%`,
                          }}
                          title={`Cancelled`}
                        />
                        {/* remainder */}
                        <div className="h-full bg-slate-800 rounded-r flex-1" />
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {pct(s.completionRate)} completion · {fmt(s.cancelled)}{" "}
                        cancelled
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Recurring Issues */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Recurring Issues</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Brand + problem combinations appearing ≥ 3 times in the
                  selected period
                </p>
              </div>
              {trends.recurringIssues.length === 0 && (
                <span className="text-emerald-400 text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  No recurring issues
                </span>
              )}
            </div>
            {trends.recurringIssues.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {[
                        "Brand",
                        "Problem",
                        "Sub-Problem",
                        "Count",
                        "Cancelled",
                        "Cancel Rate",
                        "Severity",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trends.recurringIssues.map(
                      (
                        issue: {
                          brand: string;
                          problem: string;
                          subProblem: string | null;
                          count: number;
                          cancelledCount: number;
                          cancellationRate: number;
                        },
                        i: number,
                      ) => (
                        <tr
                          key={i}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-200 text-sm font-medium">
                            {issue.brand ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-300 text-sm">
                            {issue.problem}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-sm">
                            {issue.subProblem ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-white font-semibold text-sm">
                              {issue.count}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-sm">
                            {issue.cancelledCount}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                issue.cancellationRate >= 40
                                  ? "text-red-400"
                                  : issue.cancellationRate >= 20
                                    ? "text-amber-400"
                                    : "text-slate-400"
                              }`}
                            >
                              {pct(issue.cancellationRate)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <SeverityBadge
                              count={issue.count}
                              cancellationRate={issue.cancellationRate}
                            />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Row: Top Problems + Cancellation Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top problems */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">
                Top Problem Categories
              </h2>
              <p className="text-slate-500 text-xs mb-4">
                Only requests using the v2 problem system are counted.
              </p>
              {trends.topProblems.length === 0 ? (
                <p className="text-slate-600 text-sm">
                  No v2 problem data in this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {trends.topProblems.map(
                    (p: {
                      _id: string;
                      count: number;
                      completedCount: number;
                      cancelledCount: number;
                    }) => (
                      <HBar
                        key={p._id}
                        label={p._id}
                        value={p.count}
                        max={problemMax}
                        sub={`${pct(p.count > 0 ? (p.completedCount / p.count) * 100 : 0)} done`}
                        color="bg-violet-500"
                      />
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Cancellation reasons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">
                Cancellation Reasons
              </h2>
              <p className="text-slate-500 text-xs mb-4">
                Top reasons among cancelled requests.
              </p>
              {trends.cancellationReasons.length === 0 ? (
                <p className="text-slate-600 text-sm">
                  No cancellations in this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {trends.cancellationReasons.map(
                    (r: { _id: string; count: number }, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 text-slate-600 text-xs font-mono w-4 shrink-0">
                          {i + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm leading-snug">
                            {r._id || "Unspecified"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500/70 rounded-full"
                                style={{
                                  width: `${
                                    trends.cancellationReasons[0]?.count > 0
                                      ? (r.count /
                                          trends.cancellationReasons[0].count) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-slate-500 text-xs shrink-0">
                              {r.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row: Top Brands + Top Cities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Top Brands</h2>
              <div className="space-y-3">
                {trends.topBrands.map((b: { _id: string; count: number }) => (
                  <HBar
                    key={b._id}
                    label={b._id ?? "Unknown"}
                    value={b.count}
                    max={brandMax}
                    color="bg-blue-500/80"
                  />
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Top Cities</h2>
              <div className="space-y-3">
                {trends.topCities.map((c: { _id: string; count: number }) => (
                  <HBar
                    key={c._id}
                    label={c._id ?? "Unknown"}
                    value={c.count}
                    max={cityMax}
                    color="bg-emerald-500/80"
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
