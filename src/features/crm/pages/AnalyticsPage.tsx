import { useState, useMemo } from "react";
import {
  useCustomerAnalytics,
  useRevenueAnalytics,
  useSubscriptionAnalytics,
  useConversionAnalytics,
  useHighValueCustomers,
  useChurnAnalysis,
  useWalletOverview,
  useFailedPayments,
  useReviewAnalytics,
  useLoyaltyOverview,
  useSegmentOverview,
} from "../hooks";
import {
  Users,
  TrendingUp,
  Star,
  Wallet,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Repeat,
  UserX,
  ShieldAlert,
  Activity,
  Package,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n?.toLocaleString("en-IN") ?? "—";
const fmtK = (n: number) =>
  n >= 100_000
    ? `₹${(n / 100_000).toFixed(1)}L`
    : n >= 1_000
      ? `₹${(n / 1_000).toFixed(1)}K`
      : `₹${n ?? 0}`;
const pct = (a: number, b: number) =>
  b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "0%";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PRESETS = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="h-4 w-4 text-blue-400" />
      <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
        {title}
      </h2>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "blue",
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: "blue" | "green" | "amber" | "red" | "violet" | "cyan";
  trend?: { direction: "up" | "down"; label: string };
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
    violet: "bg-violet-500/10 text-violet-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${trend.direction === "up" ? "text-emerald-400" : "text-red-400"}`}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.label}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-3 tabular-nums">{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </Card>
  );
}

function BarChart({
  data,
  valueKey,
  labelKey,
  total,
  colorClass = "bg-blue-500",
  formatValue,
}: {
  data: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
  total?: number;
  colorClass?: string;
  formatValue?: (v: number) => string;
}) {
  const max = total ?? Math.max(...data.map((d) => Number(d[valueKey]) || 0));
  return (
    <div className="space-y-2.5">
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const label = String(item[labelKey] ?? "—");
        const width = max > 0 ? Math.round((val / max) * 100) : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-slate-400 text-xs w-28 shrink-0 capitalize truncate">
              {label}
            </span>
            <div className="flex-1 bg-slate-800 rounded-full h-1.5">
              <div
                className={`${colorClass} h-1.5 rounded-full transition-all`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-slate-300 text-xs w-20 text-right tabular-nums shrink-0">
              {formatValue ? formatValue(val) : fmt(val)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 100);
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div
              className="w-full bg-blue-500/80 rounded-sm transition-all group-hover:bg-blue-400"
              style={{ height: `${h}%`, minHeight: d.value > 0 ? 2 : 0 }}
            />
            <span className="text-slate-600 text-[9px] truncate">
              {d.label}
            </span>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.label}: {fmt(d.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pctW = total > 0 ? (count / total) * 100 : 0;
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-400",
    "bg-lime-400",
    "bg-emerald-400",
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-xs w-8 shrink-0">{star}★</span>
      <div className="flex-1 bg-slate-800 rounded-full h-1.5">
        <div
          className={`${colors[star - 1]} h-1.5 rounded-full`}
          style={{ width: `${pctW}%` }}
        />
      </div>
      <span className="text-slate-500 text-xs w-6 text-right">{count}</span>
    </div>
  );
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  const color =
    value >= 4
      ? "text-emerald-400"
      : value >= 3
        ? "text-amber-400"
        : "text-red-400";
  const bgColor =
    value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-xs">{label}</span>
        <span className={`text-xs font-semibold ${color}`}>
          {value?.toFixed(1) ?? "—"}/5
        </span>
      </div>
      <div className="bg-slate-800 rounded-full h-1.5">
        <div
          className={`${bgColor} h-1.5 rounded-full`}
          style={{ width: `${((value ?? 0) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const now = useMemo(() => new Date(), []);
  const [activePreset, setActivePreset] = useState(1); // default 30 days
  const [dateRange, setDateRange] = useState({
    from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: now.toISOString(),
  });

  const setPreset = (days: number, idx: number) => {
    setActivePreset(idx);
    setDateRange({
      from: new Date(
        new Date().getTime() - days * 24 * 60 * 60 * 1000,
      ).toISOString(),
      to: new Date().toISOString(),
    });
  };

  // ── Data hooks ──
  const { data: custRes, isLoading: custLoading } = useCustomerAnalytics();
  const { data: revRes, isLoading: revLoading } = useRevenueAnalytics({
    from: dateRange.from,
    to: dateRange.to,
  });
  const { data: subRes, isLoading: subLoading } = useSubscriptionAnalytics();
  const { data: convRes, isLoading: convLoading } = useConversionAnalytics({
    from: dateRange.from,
    to: dateRange.to,
  });
  const { data: highValRes } = useHighValueCustomers(10);
  const { data: churnRes } = useChurnAnalysis({ inactiveDays: 90 });
  const { data: walletRes, isLoading: walletLoading } = useWalletOverview();
  const { data: failedRes } = useFailedPayments();
  const { data: reviewRes, isLoading: reviewLoading } = useReviewAnalytics();
  const { data: loyaltyRes } = useLoyaltyOverview();
  const { data: segmentRes, isLoading: segLoading } = useSegmentOverview();

  // ── Derived data ──
  const kpis = custRes?.data;
  const rev = revRes?.data;
  const sub = subRes?.data as
    | {
        totalActive: number;
        planBreakdown: { planName: string; planPrice: number; count: number }[];
        statusBreakdown: { _id: string; count: number }[];
        monthlyTrend: {
          _id: { year: number; month: number };
          newSubscriptions: number;
        }[];
      }
    | undefined;
  const conv = convRes?.data as
    | {
        totalSRs: number;
        completedSRs: number;
        totalNewUsers: number;
        usersWithSubscription: number;
        usersWithWallet: number;
        campaignStats: {
          totalCampaigns: number;
          totalSent: number;
          totalConverted: number;
        };
      }
    | undefined;
  const wallet = walletRes?.data;
  const reviews = reviewRes?.data;
  const loyalty = loyaltyRes?.data;
  const segments = segmentRes?.data;
  const highValueList = highValRes?.data as
    | { username?: string; email?: string; totalSpent?: number }[]
    | undefined;
  const churnList = churnRes?.data as
    | { username?: string; email?: string; lastOrderDate?: string }[]
    | undefined;
  const churnTotal = churnRes?.pagination?.total ?? 0;

  // Revenue trend → mini bar chart
  const revTrendChart = useMemo(() => {
    if (!rev?.revenueTrend?.length) return [];
    const sorted = [...rev.revenueTrend].sort((a, b) => {
      const da = new Date(a._id.year, (a._id.month ?? 1) - 1, a._id.day ?? 1);
      const db = new Date(b._id.year, (b._id.month ?? 1) - 1, b._id.day ?? 1);
      return da.getTime() - db.getTime();
    });
    // Thin it to at most 30 bars
    const step = Math.ceil(sorted.length / 30);
    return sorted
      .filter((_, i) => i % step === 0)
      .map((d) => ({
        label: d._id.day
          ? `${d._id.day}/${d._id.month}`
          : `${MONTH_NAMES[(d._id.month ?? 1) - 1]}`,
        value: d.revenue,
      }));
  }, [rev]);

  // Sub monthly trend → bar chart
  const subTrendChart = useMemo(() => {
    if (!sub?.monthlyTrend?.length) return [];
    return sub.monthlyTrend.slice(-12).map((d) => ({
      label: `${MONTH_NAMES[d._id.month - 1]} ${String(d._id.year).slice(-2)}`,
      value: d.newSubscriptions,
    }));
  }, [sub]);

  const totalSubsByStatus = useMemo(
    () => sub?.statusBreakdown?.reduce((s, x) => s + x.count, 0) ?? 0,
    [sub],
  );

  const reviewTotal = reviews?.overall?.total ?? 0;
  const ratingDistMap = useMemo(() => {
    const m: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews?.ratingDistribution?.forEach((r) => {
      m[r._id] = r.count;
    });
    return m;
  }, [reviews]);

  // Segment groups
  const segmentGroups = segments
    ? [
        {
          title: "Demographics",
          items: [
            {
              label: "New This Month",
              value: segments.newThisMonth,
              icon: TrendingUp,
              color: "green",
            },
            {
              label: "Returning",
              value: segments.returning,
              icon: Repeat,
              color: "blue",
            },
            {
              label: "High Usage",
              value: segments.highUsage,
              icon: Activity,
              color: "violet",
            },
            {
              label: "Recent Active (30d)",
              value: segments.recentActive,
              icon: CheckCircle2,
              color: "cyan",
            },
          ],
        },
        {
          title: "Subscriptions",
          items: [
            {
              label: "Active Subscribers",
              value: segments.activeSubscribers,
              icon: Crown,
              color: "amber",
            },
            {
              label: "Trial",
              value: segments.trial,
              icon: Package,
              color: "blue",
            },
            {
              label: "Expired",
              value: segments.expiredSubscription,
              icon: AlertTriangle,
              color: "red",
            },
            {
              label: "Cancelled",
              value: segments.cancelledSubscription,
              icon: UserX,
              color: "red",
            },
            {
              label: "No Subscription",
              value: segments.noSubscription,
              icon: Users,
              color: "cyan",
            },
          ],
        },
        {
          title: "Loyalty",
          items: [
            {
              label: "High Value",
              value: segments.highValue,
              icon: Crown,
              color: "amber",
            },
            {
              label: "At Risk",
              value: segments.atRisk,
              icon: ShieldAlert,
              color: "red",
            },
            {
              label: "Wallet Active",
              value: segments.walletActive,
              icon: Wallet,
              color: "green",
            },
            {
              label: "Inactive",
              value: segments.inactive,
              icon: UserX,
              color: "red",
            },
          ],
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Analytics & Reporting
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Comprehensive CRM insights and metrics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPreset(p.days, i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activePreset === i
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-1">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={dateRange.from.slice(0, 10)}
              onChange={(e) => {
                setActivePreset(-1);
                setDateRange((d) => ({
                  ...d,
                  from: new Date(e.target.value).toISOString(),
                }));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-600 text-xs">to</span>
            <input
              type="date"
              value={dateRange.to.slice(0, 10)}
              onChange={(e) => {
                setActivePreset(-1);
                setDateRange((d) => ({
                  ...d,
                  to: new Date(e.target.value).toISOString(),
                }));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Top KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {custLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <KpiCard
              label="Total Customers"
              value={fmt(kpis?.totalCustomers ?? 0)}
              icon={Users}
              color="blue"
              sub={`${fmt(kpis?.activeCustomers ?? 0)} active`}
            />
            <KpiCard
              label="Active Subscribers"
              value={fmt(kpis?.activeSubscribers ?? 0)}
              icon={Crown}
              color="amber"
              sub={kpis?.subscriptionRate}
            />
            <KpiCard
              label="New This Month"
              value={fmt(kpis?.monthlyNewCustomers ?? 0)}
              icon={TrendingUp}
              color="green"
              trend={{
                direction:
                  parseFloat(kpis?.growthRate ?? "0") >= 0 ? "up" : "down",
                label: kpis?.growthRate ?? "—",
              }}
            />
            <KpiCard
              label="Avg Satisfaction"
              value={
                typeof kpis?.avgCustomerSatisfaction === "number"
                  ? (kpis.avgCustomerSatisfaction as number).toFixed(1) + " ★"
                  : (kpis?.avgCustomerSatisfaction ?? "—")
              }
              icon={Star}
              color="amber"
              sub={`${fmt(kpis?.totalReviews ?? 0)} reviews`}
            />
            <KpiCard
              label="Wallet Balance"
              value={fmtK(wallet?.summary?.totalBalance ?? 0)}
              icon={Wallet}
              color="cyan"
              sub={`${fmt(wallet?.summary?.customers ?? 0)} wallets`}
            />
            <KpiCard
              label="Failed Payments"
              value={fmt(failedRes?.pagination?.total ?? 0)}
              icon={CreditCard}
              color="red"
              sub="Needs attention"
            />
          </>
        )}
      </div>

      {/* ── Revenue Analytics ── */}
      <Card className="p-6">
        <SectionHeader title="Revenue Analytics" icon={BarChart3} />
        {revLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-3xl font-bold text-white tabular-nums">
                  {fmtK(rev?.totalRevenue ?? 0)}
                </p>
                <p className="text-slate-400 text-sm mt-1">Total Revenue</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {dateRange.from.slice(0, 10)} – {dateRange.to.slice(0, 10)}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400 tabular-nums">
                  {fmtK(rev?.refundStats?.totalRefundAmount ?? 0)}
                </p>
                <p className="text-slate-400 text-sm mt-1">Total Refunds</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {rev?.refundStats?.totalRefunds ?? 0} transactions
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-400 tabular-nums">
                  {rev?.totalRevenue && rev.refundStats?.totalRefundAmount
                    ? (
                        ((rev.totalRevenue -
                          rev.refundStats.totalRefundAmount) /
                          rev.totalRevenue) *
                        100
                      ).toFixed(1) + "%"
                    : "100%"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Net Retention Rate
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Revenue after refunds
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {rev?.revenueTrend?.length
                    ? fmtK(
                        Math.round(rev.totalRevenue / rev.revenueTrend.length),
                      )
                    : "—"}
                </p>
                <p className="text-slate-400 text-sm mt-1">Avg Daily Revenue</p>
                <p className="text-slate-500 text-xs mt-0.5">Per active day</p>
              </div>
            </div>

            {/* Revenue trend bar chart */}
            {revTrendChart.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                  Revenue Trend
                </p>
                <MiniBarChart data={revTrendChart} />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {rev?.revenueByServiceType?.length ? (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                    By Service Type
                  </p>
                  <BarChart
                    data={rev.revenueByServiceType}
                    valueKey="revenue"
                    labelKey="_id"
                    total={rev.totalRevenue}
                    colorClass="bg-blue-500"
                    formatValue={fmtK}
                  />
                </div>
              ) : null}
              {rev?.topCitiesByRevenue?.length ? (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                    Top Cities
                  </p>
                  <BarChart
                    data={rev.topCitiesByRevenue}
                    valueKey="revenue"
                    labelKey="_id"
                    total={rev.totalRevenue}
                    colorClass="bg-violet-500"
                    formatValue={fmtK}
                  />
                </div>
              ) : null}
            </div>
          </>
        )}
      </Card>

      {/* ── Conversion + Subscription ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversion Analytics */}
        <Card className="p-6">
          <SectionHeader title="Conversion Analytics" icon={TrendingUp} />
          {convLoading ? (
            <Skeleton className="h-40" />
          ) : conv ? (
            <div className="space-y-4">
              {/* Big conversion rates */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "SR Completion",
                    value: pct(conv.completedSRs, conv.totalSRs),
                    sub: `${fmt(conv.completedSRs)} / ${fmt(conv.totalSRs)}`,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Sub Conversion",
                    value: pct(conv.usersWithSubscription, conv.totalNewUsers),
                    sub: `${fmt(conv.usersWithSubscription)} subscribed`,
                    color: "text-amber-400",
                  },
                  {
                    label: "Wallet Activation",
                    value: pct(conv.usersWithWallet, conv.totalNewUsers),
                    sub: `${fmt(conv.usersWithWallet)} wallets`,
                    color: "text-cyan-400",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="bg-slate-800/60 rounded-xl p-3 text-center"
                  >
                    <p className={`text-xl font-bold tabular-nums ${m.color}`}>
                      {m.value}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">{m.label}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>
              {/* Campaign stats */}
              {conv.campaignStats && (
                <div className="border-t border-slate-800 pt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                    Campaign Performance
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Campaigns",
                        value: fmt(conv.campaignStats.totalCampaigns),
                      },
                      {
                        label: "Total Sent",
                        value: fmt(conv.campaignStats.totalSent),
                      },
                      {
                        label: "Converted",
                        value: fmt(conv.campaignStats.totalConverted),
                      },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold text-white tabular-nums">
                          {s.value}
                        </p>
                        <p className="text-slate-500 text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {conv.campaignStats.totalSent > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Campaign conversion rate</span>
                        <span>
                          {pct(
                            conv.campaignStats.totalConverted,
                            conv.campaignStats.totalSent,
                          )}
                        </span>
                      </div>
                      <div className="bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 h-1.5 rounded-full"
                          style={{
                            width: pct(
                              conv.campaignStats.totalConverted,
                              conv.campaignStats.totalSent,
                            ),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </Card>

        {/* Subscription Analytics */}
        <Card className="p-6">
          <SectionHeader title="Subscription Analytics" icon={Package} />
          {subLoading ? (
            <Skeleton className="h-40" />
          ) : sub ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <p className="text-3xl font-bold text-white tabular-nums">
                    {fmt(sub.totalActive)}
                  </p>
                  <p className="text-slate-400 text-sm">Active Subscriptions</p>
                </div>
              </div>

              {/* Status breakdown */}
              {sub.statusBreakdown?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Status Breakdown
                  </p>
                  {sub.statusBreakdown.map((s) => {
                    const statusColors: Record<string, string> = {
                      active: "bg-emerald-500",
                      trial: "bg-blue-500",
                      expired: "bg-red-500",
                      cancelled: "bg-red-700",
                      paused: "bg-amber-500",
                    };
                    return (
                      <div key={s._id} className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs w-20 capitalize">
                          {s._id}
                        </span>
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`${statusColors[s._id] ?? "bg-slate-500"} h-1.5 rounded-full`}
                            style={{ width: pct(s.count, totalSubsByStatus) }}
                          />
                        </div>
                        <span className="text-slate-300 text-xs w-8 text-right tabular-nums">
                          {s.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Plan breakdown */}
              {sub.planBreakdown?.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                    Plans
                  </p>
                  <div className="space-y-1.5">
                    {sub.planBreakdown.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-300 text-sm">
                          {p.planName ?? "Unknown Plan"}
                        </span>
                        <div className="flex items-center gap-3">
                          {p.planPrice && (
                            <span className="text-slate-500 text-xs">
                              ₹{p.planPrice}/mo
                            </span>
                          )}
                          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                            {p.count} users
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly trend */}
              {subTrendChart.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                    New Subscriptions / Month
                  </p>
                  <MiniBarChart data={subTrendChart} />
                </div>
              )}
            </div>
          ) : null}
        </Card>
      </div>

      {/* ── Review Analytics ── */}
      <Card className="p-6">
        <SectionHeader title="Review Analytics" icon={Star} />
        {reviewLoading ? (
          <Skeleton className="h-32" />
        ) : reviews ? (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Overall */}
            <div>
              <div className="flex items-end gap-3 mb-4">
                <p className="text-5xl font-bold text-white tabular-nums">
                  {reviews.overall?.avgRating?.toFixed(1) ?? "—"}
                </p>
                <div className="pb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(reviews.overall?.avgRating ?? 0) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {fmt(reviewTotal)} reviews
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((s) => (
                  <RatingBar
                    key={s}
                    star={s}
                    count={ratingDistMap[s] ?? 0}
                    total={reviewTotal}
                  />
                ))}
              </div>
            </div>

            {/* Sub-scores */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-4">
                Quality Breakdown
              </p>
              <div className="space-y-4">
                <ScoreMeter
                  label="Service Quality"
                  value={reviews.overall?.avgServiceQuality ?? 0}
                />
                <ScoreMeter
                  label="Communication"
                  value={reviews.overall?.avgCommunication ?? 0}
                />
                <ScoreMeter
                  label="Punctuality"
                  value={reviews.overall?.avgPunctuality ?? 0}
                />
              </div>
            </div>

            {/* Monthly trend */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                Monthly Trend
              </p>
              {reviews.monthlyTrend?.length ? (
                <MiniBarChart
                  data={reviews.monthlyTrend.slice(-12).map((m) => ({
                    label: MONTH_NAMES[m._id.month - 1],
                    value: m.count,
                  }))}
                />
              ) : (
                <p className="text-slate-600 text-sm">No trend data</p>
              )}
              {reviews.monthlyTrend?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {reviews.monthlyTrend
                    .slice(-3)
                    .reverse()
                    .map((m, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          {MONTH_NAMES[m._id.month - 1]} {m._id.year}
                        </span>
                        <span className="text-slate-300 tabular-nums">
                          {m.count} reviews · {m.avgRating?.toFixed(1)}★
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      {/* ── Wallet Overview ── */}
      <Card className="p-6">
        <SectionHeader title="Wallet & Payments" icon={Wallet} />
        {walletLoading ? (
          <Skeleton className="h-28" />
        ) : wallet ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  {
                    label: "Total Balance",
                    value: fmtK(wallet.summary?.totalBalance ?? 0),
                    color: "text-cyan-400",
                  },
                  {
                    label: "Total Credited",
                    value: fmtK(wallet.summary?.totalCredited ?? 0),
                    color: "text-emerald-400",
                  },
                  {
                    label: "Total Debited",
                    value: fmtK(wallet.summary?.totalDebited ?? 0),
                    color: "text-red-400",
                  },
                  {
                    label: "Avg Balance",
                    value: fmtK(wallet.summary?.avgBalance ?? 0),
                    color: "text-slate-300",
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/60 rounded-xl p-3">
                    <p className={`text-lg font-bold tabular-nums ${s.color}`}>
                      {s.value}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Users className="h-3 w-3" />
                <span>
                  {fmt(wallet.summary?.customers ?? 0)} customers with wallets
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                Top Wallet Holders
              </p>
              <div className="space-y-2">
                {wallet.topWalletHolders?.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                        {i + 1}
                      </span>
                      <span className="text-slate-300 text-sm">
                        {h.userId?.username ?? h.userId?.email ?? "Unknown"}
                      </span>
                    </div>
                    <span className="text-cyan-400 text-sm font-medium tabular-nums">
                      {fmtK(h.balance)}
                    </span>
                  </div>
                )) ?? <p className="text-slate-600 text-sm">No data</p>}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* ── Customer Segments ── */}
      <Card className="p-6">
        <SectionHeader title="Customer Segments" icon={Users} />
        {segLoading ? (
          <Skeleton className="h-32" />
        ) : segments ? (
          <>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl font-bold text-white tabular-nums">
                {fmt(segments.total)}
              </span>
              <span className="text-slate-400 text-sm">total customers</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {segmentGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                    {group.title}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const pctOf =
                        segments.total > 0
                          ? (item.value / segments.total) * 100
                          : 0;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-2"
                        >
                          <Icon className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                          <span className="text-slate-400 text-xs flex-1 min-w-0 truncate">
                            {item.label}
                          </span>
                          <div className="w-20 bg-slate-800 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${pctOf}%` }}
                            />
                          </div>
                          <span className="text-slate-300 text-xs w-8 text-right tabular-nums shrink-0">
                            {fmt(item.value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Card>

      {/* ── Loyalty ── */}
      {loyalty && (
        <Card className="p-6">
          <SectionHeader title="Loyalty Overview" icon={Crown} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Active Subscribers",
                value: fmt(loyalty.activeSubscribers),
                color: "text-amber-400",
              },
              {
                label: "Repeat Customers",
                value: fmt(loyalty.repeatCustomers),
                color: "text-emerald-400",
              },
              {
                label: "Avg Orders / Customer",
                value: String(loyalty.avgOrdersPerCustomer ?? "—"),
                color: "text-blue-400",
              },
              {
                label: "Wallet Total Balance",
                value: fmtK(loyalty.wallet?.totalBalance ?? 0),
                color: "text-cyan-400",
              },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl p-4">
                <p className={`text-2xl font-bold tabular-nums ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {loyalty.subscriptionsByPlan?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">
                Subscriptions by Plan
              </p>
              <BarChart
                data={loyalty.subscriptionsByPlan.map((p) => ({
                  _id: p.planName,
                  count: p.count,
                }))}
                valueKey="count"
                labelKey="_id"
                colorClass="bg-amber-500"
              />
            </div>
          )}
        </Card>
      )}

      {/* ── High Value + Churn ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionHeader title="High Value Customers" icon={Crown} />
          {highValueList?.length ? (
            <div className="space-y-2">
              {highValueList.slice(0, 10).map((c, i) => {
                const max = highValueList[0]?.totalSpent ?? 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-slate-600/40 text-slate-300" : i === 2 ? "bg-orange-900/40 text-orange-400" : "bg-slate-800 text-slate-500"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-slate-200 text-sm truncate">
                          {c.username ?? c.email ?? "—"}
                        </span>
                        <span className="text-emerald-400 text-sm font-medium tabular-nums shrink-0">
                          {fmtK(c.totalSpent ?? 0)}
                        </span>
                      </div>
                      <div className="bg-slate-800 rounded-full h-1">
                        <div
                          className="bg-emerald-500 h-1 rounded-full"
                          style={{
                            width: `${max > 0 ? ((c.totalSpent ?? 0) / max) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No data</p>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeader title="Churn Risk" icon={AlertTriangle} />
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/10 rounded-xl p-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400 tabular-nums">
                {fmt(churnTotal)}
              </p>
              <p className="text-slate-400 text-sm">
                Customers inactive 90+ days
              </p>
            </div>
          </div>
          {churnList?.length ? (
            <div className="space-y-2">
              {churnList.slice(0, 8).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-slate-300 text-sm">
                      {c.username ?? c.email ?? "—"}
                    </span>
                  </div>
                  {c.lastOrderDate && (
                    <span className="text-slate-600 text-xs">
                      Last:{" "}
                      {new Date(c.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
              ))}
              {churnTotal > 8 && (
                <p className="text-slate-600 text-xs pt-1">
                  +{churnTotal - 8} more at risk
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              No churn risk detected
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
