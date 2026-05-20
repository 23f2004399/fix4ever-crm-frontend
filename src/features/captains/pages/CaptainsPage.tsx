import { useState } from "react";
import { Link } from "react-router-dom";
import { useCaptains, useCaptainStats } from "../hooks";
import { PermissionGate } from "@/shared/components/PermissionGate";
import type { Captain } from "../types";

const ONBOARDING_LABELS: Record<string, string> = {
  "Not Started": "Not Started",
  "In Progress": "In Progress",
  "In Review": "Pending Review",
  Approved: "Approved",
  Rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "In Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Rejected: "bg-slate-700 text-slate-400 border-slate-600",
  "Not Started": "bg-slate-800 text-slate-500 border-slate-700",
};

const AVAIL_COLORS: Record<string, string> = {
  Available: "bg-emerald-500/10 text-emerald-400",
  "On Trip": "bg-blue-500/10 text-blue-400",
  Offline: "bg-slate-700 text-slate-400",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
      ★ {rating?.toFixed(1) ?? "—"}
    </span>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function CaptainsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);

  const { data: statsRes } = useCaptainStats();
  const { data: listRes, isLoading } = useCaptains({
    search: search || undefined,
    onboardingStatus: status || undefined,
    availability: availability || undefined,
    page,
    limit: 20,
  });

  const stats = statsRes?.data;
  const captains: Captain[] = listRes?.data ?? [];
  const pagination = listRes?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Captains</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination?.total?.toLocaleString() ?? 0} delivery drivers on the
            platform
          </p>
        </div>
        <PermissionGate permission="captains.wallet_view">
          <Link
            to="settlements"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-xl border border-slate-700 transition-colors"
          >
            Settlement Queue
          </Link>
        </PermissionGate>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            color="text-amber-400"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            color="text-emerald-400"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            color="text-red-400"
          />
          <StatCard
            label="Suspended"
            value={stats.suspended}
            color="text-red-300"
          />
          <StatCard
            label="Available Now"
            value={stats.available}
            color="text-emerald-400"
          />
          <StatCard
            label="On Trip"
            value={stats.onTrip}
            color="text-blue-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search name, email or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="In Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="In Progress">In Progress</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Availability</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            Loading captains…
          </div>
        ) : captains.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            No captains match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Captain
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Contact
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Vehicle
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Availability
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">
                    Rating
                  </th>
                  <th className="text-left text-slate-400 font-medium px-4 py3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {captains.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold flex-shrink-0">
                          {(c.personalInfo?.fullName ?? "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">
                            {c.personalInfo?.fullName ?? "—"}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {c.personalInfo?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {c.personalInfo?.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      <p>
                        {c.vehicleDetails?.vehicleType} ·{" "}
                        {c.vehicleDetails?.licensePlate}
                      </p>
                      <p className="text-slate-500">
                        {c.vehicleDetails?.vehicleBrand}{" "}
                        {c.vehicleDetails?.vehicleModel}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[c.onboardingStatus] ?? STATUS_COLORS["Not Started"]}`}
                      >
                        {ONBOARDING_LABELS[c.onboardingStatus] ??
                          c.onboardingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${AVAIL_COLORS[c.availability] ?? AVAIL_COLORS["Offline"]}`}
                      >
                        {c.availability}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={c.averageRating} />
                      <p className="text-slate-500 text-xs">
                        {c.totalReviews} reviews
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={c._id}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg border border-blue-500/20 transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            Page {page} of {totalPages} · {pagination?.total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
