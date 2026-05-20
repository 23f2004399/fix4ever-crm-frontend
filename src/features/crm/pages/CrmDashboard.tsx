import {
  useCustomerAnalytics,
  useWalletOverview,
  useLoyaltyOverview,
  useTickets,
} from "../hooks";

function StatCard({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "violet" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

export function CrmDashboard() {
  const { data: analytics, isLoading: loadingAnalytics } =
    useCustomerAnalytics();
  const { data: wallet } = useWalletOverview();
  const { data: loyalty } = useLoyaltyOverview();
  const { data: tickets } = useTickets({ status: "open", limit: 5 });

  const kpis = analytics?.data;
  const walletSummary = wallet?.data?.summary;
  const loyaltyData = loyalty?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">CRM Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Customer relationship overview and key metrics
        </p>
      </div>

      {/* KPI Grid */}
      {loadingAnalytics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 animate-pulse h-28"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Customers"
            value={kpis?.totalCustomers?.toLocaleString() ?? 0}
            sub={`${kpis?.activeCustomers} active`}
            color="blue"
          />
          <StatCard
            label="Active Subscribers"
            value={kpis?.activeSubscribers?.toLocaleString() ?? 0}
            sub={kpis?.subscriptionRate}
            color="green"
          />
          <StatCard
            label="New This Month"
            value={kpis?.monthlyNewCustomers ?? 0}
            sub={`Growth: ${kpis?.growthRate}`}
            color="violet"
          />
          <StatCard
            label="Avg Satisfaction"
            value={kpis?.avgCustomerSatisfaction ?? 0}
            sub={`${kpis?.totalReviews} reviews`}
            color="amber"
          />
          <StatCard
            label="Wallet Balance"
            value={`₹${((walletSummary?.totalBalance ?? 0) / 1000).toFixed(1)}K`}
            sub={`${walletSummary?.customers} wallets`}
            color="green"
          />
          <StatCard
            label="Total Credited"
            value={`₹${((walletSummary?.totalCredited ?? 0) / 1000).toFixed(1)}K`}
            color="blue"
          />
          <StatCard
            label="Repeat Customers"
            value={loyaltyData?.repeatCustomers ?? 0}
            sub={`Avg ${loyaltyData?.avgOrdersPerCustomer} orders`}
            color="violet"
          />
          <StatCard
            label="Inactive Customers"
            value={kpis?.inactiveCustomers ?? 0}
            sub="Potential churn"
            color="red"
          />
        </div>
      )}

      {/* Open Tickets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Open Tickets</h2>
          <a
            href="/crm/tickets"
            className="text-blue-400 text-sm hover:text-blue-300"
          >
            View all →
          </a>
        </div>
        {tickets?.data?.length ? (
          <div className="space-y-3">
            {tickets.data.slice(0, 5).map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
              >
                <div>
                  <p className="text-slate-200 text-sm font-medium">
                    {t.title}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {t.category?.replace("_", " ")} •{" "}
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-lg border ${
                    t.priority === "critical"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : t.priority === "high"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-700 text-slate-400 border-slate-600"
                  }`}
                >
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No open tickets</p>
        )}
      </div>
    </div>
  );
}
