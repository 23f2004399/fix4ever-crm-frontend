import {
  useLoyaltyOverview,
  useHighValueCustomers,
  useChurnAnalysis,
} from "../hooks";

export function LoyaltyPage() {
  const { data: loyalty, isLoading } = useLoyaltyOverview();
  const { data: highValue } = useHighValueCustomers(15);
  const { data: churn } = useChurnAnalysis({ inactiveDays: 60 });

  const l = loyalty?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Loyalty & Retention</h1>
        <p className="text-slate-400 text-sm mt-1">
          Customer lifetime value and retention insights
        </p>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : l ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Active Subscribers",
              value: l.activeSubscribers?.toLocaleString(),
              color: "text-blue-400",
            },
            {
              label: "Wallet Holders",
              value: `${l.wallet?.activeWallets?.toLocaleString()} / ${l.wallet?.totalWallets?.toLocaleString()}`,
              color: "text-green-400",
            },
            {
              label: "Repeat Customers",
              value: l.repeatCustomers?.toLocaleString(),
              color: "text-violet-400",
            },
            {
              label: "Avg Orders/Customer",
              value: String(l.avgOrdersPerCustomer ?? 0),
              color: "text-amber-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Subscriptions by plan + Wallet summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">
            Subscriptions by Plan
          </h2>
          {l?.subscriptionsByPlan?.length ? (
            <div className="space-y-3">
              {l.subscriptionsByPlan.map((plan) => {
                const total = l.activeSubscribers || 1;
                return (
                  <div key={plan.planName} className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm flex-1 truncate">
                      {plan.planName ?? "Unknown"}
                    </span>
                    <div className="w-32 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(plan.count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-sm w-10 text-right">
                      {plan.count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No subscription data</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Wallet Overview</h2>
          {l?.wallet ? (
            <div className="space-y-3">
              {[
                {
                  label: "Total Wallets",
                  value: l.wallet.totalWallets?.toLocaleString(),
                },
                {
                  label: "Active Wallets",
                  value: l.wallet.activeWallets?.toLocaleString(),
                },
                {
                  label: "Total Balance",
                  value: `₹${(l.wallet.totalBalance / 1000).toFixed(1)}K`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                >
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-white font-medium text-sm">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Loading...</p>
          )}
        </div>
      </div>

      {/* High Value + At Risk */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">
            Top High-Value Customers
          </h2>
          <div className="space-y-2">
            {(
              highValue?.data as {
                username?: string;
                email?: string;
                totalSpent?: number;
              }[]
            )?.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm truncate">
                    {c.username ?? c.email ?? "—"}
                  </p>
                </div>
                <span className="text-emerald-400 text-sm font-semibold">
                  ₹{(c.totalSpent ?? 0).toLocaleString()}
                </span>
              </div>
            )) ?? <p className="text-slate-500 text-sm">Loading...</p>}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Churn Risk</h2>
          <p className="text-slate-500 text-xs mb-4">
            Inactive for 60+ days: {churn?.pagination?.total ?? 0} customers
          </p>
          <div className="space-y-2">
            {(
              churn?.data as {
                username?: string;
                email?: string;
                isActive?: boolean;
              }[]
            )
              ?.slice(0, 8)
              .map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-slate-300 text-sm truncate">
                    {c.username ?? c.email ?? "—"}
                  </p>
                  {!c.isActive && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 ml-auto">
                      Blocked
                    </span>
                  )}
                </div>
              )) ?? <p className="text-slate-500 text-sm">Loading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
