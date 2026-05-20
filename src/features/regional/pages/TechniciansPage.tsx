import { useRegionalStore } from "@/store";
import { useTechnicians, useTechnicianWorkload } from "../hooks";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg
        className="w-3.5 h-3.5 text-amber-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      <span className="text-amber-400 text-sm font-medium">
        {rating?.toFixed(1) ?? "—"}
      </span>
    </div>
  );
}

const ONBOARDING_STATUSES = [
  "",
  "approved",
  "pending",
  "suspended",
  "rejected",
];

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  rejected: "bg-slate-700 text-slate-400 border-slate-600",
};

export function TechniciansPage() {
  const {
    technicianFilters,
    technicianPage,
    setTechnicianFilter,
    setTechnicianPage,
  } = useRegionalStore();

  const { data, isLoading } = useTechnicians({
    search: technicianFilters.search || undefined,
    onboardingStatus: technicianFilters.onboardingStatus || undefined,
    minRating: technicianFilters.minRating,
    page: technicianPage,
    limit: 20,
  });
  const { data: workload } = useTechnicianWorkload();

  const technicians = data?.data ?? [];
  const pagination = data?.pagination;
  const workloadMap = new Map(
    (workload?.data ?? []).map((w) => [w._id, w.activeJobs]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Technicians</h1>
        <p className="text-slate-400 text-sm mt-1">
          {pagination?.total.toLocaleString() ?? 0} technicians in your region
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={technicianFilters.search}
          onChange={(e) => setTechnicianFilter("search", e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={technicianFilters.onboardingStatus}
          onChange={(e) =>
            setTechnicianFilter("onboardingStatus", e.target.value)
          }
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
        >
          {ONBOARDING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>
        <select
          value={technicianFilters.minRating ?? ""}
          onChange={(e) =>
            setTechnicianFilter(
              "minRating",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none"
        >
          <option value="">Any rating</option>
          {[4.5, 4, 3.5, 3].map((r) => (
            <option key={r} value={r}>
              {r}+ stars
            </option>
          ))}
        </select>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No technicians found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {technicians.map((t) => {
            const activeJobs = workloadMap.get(t._id) ?? 0;
            return (
              <div
                key={t._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 text-sm font-semibold flex-shrink-0">
                      {(t.pocInfo?.fullName ?? "T")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-medium leading-tight">
                        {t.pocInfo?.fullName ?? "—"}
                      </p>
                      <p className="text-slate-500 text-xs truncate max-w-[140px]">
                        {t.pocInfo?.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md border flex-shrink-0 ${STATUS_COLORS[t.onboardingStatus] ?? "bg-slate-700 text-slate-400 border-slate-600"}`}
                  >
                    {t.onboardingStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <RatingStars rating={t.averageRating} />
                  <span className="text-slate-500 text-xs">
                    {t.totalReviews} reviews
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${activeJobs >= 5 ? "bg-red-400" : activeJobs >= 3 ? "bg-amber-400" : "bg-green-400"}`}
                    />
                    <span className="text-slate-400 text-xs">
                      {activeJobs} active jobs
                    </span>
                  </div>
                  {t.Level && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      Level {t.Level}
                    </span>
                  )}
                </div>

                {t.operationalDetails?.serviceAreas?.length ? (
                  <p className="text-slate-600 text-xs mt-2 truncate">
                    Areas: {t.operationalDetails.serviceAreas.join(", ")}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setTechnicianPage(technicianPage - 1)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setTechnicianPage(technicianPage + 1)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
