/**
 * User Table
 *
 * Admin table of all users with infinite scroll, search filter, and role management.
 * Opens RoleAssigner modal when admin clicks "Manage roles" on a non-admin user.
 */
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/store";
import { fetchUsers } from "../api";
import { RoleAssigner } from "./RoleAssigner";
import {
  type AdminUser,
  type AssignableRole,
  ROLE_LABELS,
  ROLE_COLORS,
  BASE_ROLE_COLORS,
} from "../types";

function RoleBadge({ role }: { role: AssignableRole }) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium border ${ROLE_COLORS[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

function BaseRoleBadge({ role }: { role: string }) {
  const color =
    BASE_ROLE_COLORS[role] ??
    "bg-slate-600/50 text-slate-300 border-slate-500/50";
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium border ${color}`}
    >
      {role}
    </span>
  );
}

function Avatar({ user }: { user: AdminUser }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 text-sm font-semibold overflow-hidden flex-shrink-0 ring-1 ring-slate-600/50">
      {user.avatar ? (
        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        (user.username ?? user.email)[0].toUpperCase()
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/80 overflow-hidden">
      <div className="p-4 border-b border-slate-700/80">
        <div className="h-10 w-72 rounded-xl animate-shimmer" />
      </div>
      <div className="divide-y divide-slate-700/50">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="w-10 h-10 rounded-xl animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded animate-shimmer" />
              <div className="h-3 w-48 rounded animate-shimmer" />
            </div>
            <div className="h-6 w-16 rounded-lg animate-shimmer" />
            <div className="h-6 w-24 rounded-lg animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserTable() {
  const { userFilters, setUserSearch } = useAdminStore();
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["admin-users"],
    queryFn: ({ pageParam = 1 }) => fetchUsers(pageParam as number, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNext) {
        return (lastPage.pagination?.page ?? 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const allUsers = data?.pages.flatMap((p) => p.users) ?? [];
  const filtered = allUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      (u.username ?? "")
        .toLowerCase()
        .includes(userFilters.search.toLowerCase()),
  );
  const totalCount = data?.pages[0]?.pagination?.total ?? 0;

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-400"
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
        </div>
        <p className="text-slate-300 font-medium">Failed to load users</p>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          Please check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={userFilters.search}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input-field pl-11 py-2.5"
          />
          {userFilters.search && (
            <button
              onClick={() => setUserSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="text-slate-500 text-sm font-medium">
          {userFilters.search ? (
            <>
              Showing{" "}
              <span className="text-slate-400 font-medium">
                {filtered.length}
              </span>{" "}
              of {totalCount} users
            </>
          ) : (
            <>
              {totalCount} user{totalCount !== 1 ? "s" : ""} total
            </>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-800/40">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">
                  Base role
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">
                  Admin roles
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-4">
                        <svg
                          className="w-7 h-7 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-400 font-medium">
                        {userFilters.search
                          ? "No users match your search"
                          : "No users yet"}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {userFilters.search
                          ? "Try a different search term"
                          : "Users will appear here once they sign up"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar user={user} />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {user.username ?? (
                              <span className="text-slate-500 italic">
                                No name
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500 text-xs truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <BaseRoleBadge role={user.baseRole} />
                    </td>
                    <td className="px-5 py-4">
                      {user.adminRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {user.adminRoles.map((role) => (
                            <RoleBadge key={role} role={role} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-400" : "bg-red-400"}`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setAssigningUser(user)}
                        disabled={user.baseRole === "admin"}
                        title={
                          user.baseRole === "admin"
                            ? "Cannot modify admin's own roles"
                            : "Manage roles"
                        }
                        className="inline-flex items-center gap-2 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition-all duration-200 hover:border-blue-500/50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Manage roles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasNextPage && (
          <div className="border-t border-slate-700/80 px-5 py-4 bg-slate-800/20">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isFetchingNextPage ? "Loading…" : "Load more users"}
            </button>
          </div>
        )}
      </div>

      {assigningUser && (
        <RoleAssigner
          user={assigningUser}
          onClose={() => setAssigningUser(null)}
        />
      )}
    </>
  );
}
