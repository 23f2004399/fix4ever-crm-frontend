import { useDashboard, useSlaReport, useTechnicianWorkload } from "../hooks";
import { useAuthStore } from "@/features/auth/store/authStore";

function StatCard({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "amber" | "red" | "violet";
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
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

export function RegionalDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading } = useDashboard();
  const { data: sla } = useSlaReport();
  const { data: workload } = useTechnicianWorkload();

  const d = dashboard?.data;
  const slaData = sla?.data;
  const techWorkload = workload?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Regional Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-slate-400 text-sm">Region:</span>
          <span className="text-blue-400 text-sm font-medium px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">
            {d?.region ?? (user as { region?: string })?.region ?? "—"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : d ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total SRs"
            value={d.serviceRequests?.total?.toLocaleString() ?? 0}
            sub={`Completed: ${d.serviceRequests?.completionRate}`}
            color="blue"
          />
          <StatCard
            label="Active Jobs"
            value={d.serviceRequests?.active ?? 0}
            sub={`Pending: ${d.serviceRequests?.pending ?? 0}`}
            color="amber"
          />
          <StatCard
            label="Revenue"
            value={`₹${((d.revenue?.total ?? 0) / 1000).toFixed(1)}K`}
            sub={`Avg: ₹${d.revenue?.avgOrderValue ?? 0}`}
            color="green"
          />
          <StatCard
            label="Technicians"
            value={d.technicians?.total ?? 0}
            sub={`Approved: ${d.technicians?.approved ?? 0}`}
            color="violet"
          />
          <StatCard
            label="SLA Violations"
            value={slaData?.summary?.slaBreached ?? 0}
            sub="Breached SLAs"
            color="red"
          />
          <StatCard
            label="Upcoming Breaches"
            value={slaData?.summary?.upcomingBreachCount ?? 0}
            sub="In next 2 hours"
            color="amber"
          />
          <StatCard
            label="Avg Satisfaction"
            value={d.avgCustomerSatisfaction ?? "—"}
            sub="Customer rating"
            color="green"
          />
          <StatCard
            label="Cancelled SRs"
            value={d.serviceRequests?.cancelled ?? 0}
            color="red"
          />
        </div>
      ) : null}

      {/* SLA Compliance */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">SLA Compliance</h2>
            <a
              href="/regional/sla"
              className="text-blue-400 text-sm hover:text-blue-300"
            >
              View details →
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray={`${parseFloat(slaData?.slaComplianceRate ?? "0")} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {slaData?.slaComplianceRate ?? "0%"}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-slate-400">
                Active:{" "}
                <span className="text-white font-medium">
                  {slaData?.summary?.active ?? 0}
                </span>
              </p>
              <p className="text-slate-400">
                Breached:{" "}
                <span className="text-red-400 font-medium">
                  {slaData?.summary?.slaBreached ?? 0}
                </span>
              </p>
              <p className="text-slate-400">
                Upcoming:{" "}
                <span className="text-amber-400 font-medium">
                  {slaData?.summary?.upcomingBreachCount ?? 0}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Technician Workload */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Technician Workload</h2>
            <a
              href="/regional/technicians"
              className="text-blue-400 text-sm hover:text-blue-300"
            >
              Manage →
            </a>
          </div>
          {techWorkload.length ? (
            <div className="space-y-2">
              {techWorkload.slice(0, 5).map((t) => (
                <div key={t._id} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm truncate flex-1">
                    {t.vendorName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${t.activeJobs >= 5 ? "bg-red-400" : t.activeJobs >= 3 ? "bg-amber-400" : "bg-green-400"}`}
                    />
                    <span className="text-slate-400 text-xs">
                      {t.activeJobs} active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No workload data</p>
          )}
        </div>
      </div>
    </div>
  );
}
