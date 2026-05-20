import { useSlaReport } from "../hooks";

export function SlaPage() {
  const { data, isLoading } = useSlaReport();
  const sla = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SLA Monitor</h1>
          <p className="text-slate-400 text-sm mt-1">
            Service Level Agreement compliance tracking
          </p>
        </div>
        {sla && (
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-400">
              {sla.slaComplianceRate}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">SLA Compliance Rate</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : sla ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Active SRs",
                value: sla.summary?.active,
                color: "text-blue-400",
              },
              {
                label: "SLA Breached",
                value: sla.summary?.slaBreached,
                color: "text-red-400",
              },
              {
                label: "Upcoming Breaches",
                value: sla.summary?.upcomingBreachCount,
                color: "text-amber-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center"
              >
                <p className={`text-3xl font-bold ${s.color}`}>
                  {s.value ?? 0}
                </p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upcoming Breaches */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Upcoming Breaches
              </h2>
              {sla.upcomingBreaches?.length ? (
                <div className="space-y-3">
                  {sla.upcomingBreaches.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                    >
                      <div>
                        <p className="text-slate-200 text-sm font-mono">
                          {item.request_id}
                        </p>
                        <p className="text-slate-500 text-xs capitalize">
                          {item.status} · {item.priority ?? "normal"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 text-xs font-medium">
                          Expires
                        </p>
                        <p className="text-slate-500 text-xs">
                          {new Date(item.timerExpiresAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No upcoming breaches</p>
              )}
            </div>

            {/* Recent Escalations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Recent Escalations
              </h2>
              {sla.recentEscalations?.length ? (
                <div className="space-y-3">
                  {sla.recentEscalations.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                    >
                      <p className="text-slate-200 text-sm font-mono">
                        {item.request_id}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No recent escalations</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
