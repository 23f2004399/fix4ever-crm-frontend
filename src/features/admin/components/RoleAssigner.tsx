/**
 * Role Assigner Modal — redesigned with vertical accordion permission layout.
 * Eliminates horizontal scrolling. Single vertical flow: role pills → permission accordion.
 * All API logic unchanged.
 */
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  assignRoles,
  clearAllRoles,
  fetchPermissionCatalog,
  fetchUserAccess,
  setUserPermissionOverrides,
} from "../api";
import { getErrorMessage } from "@/shared/utils/error";
import {
  type AdminUser,
  type AssignableRole,
  type PermissionKey,
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
} from "../types";

interface RoleAssignerProps {
  user: AdminUser;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<AssignableRole, string> = {
  crm_manager: "Customer & technician oversight",
  editor: "Content & notification management",
  regional_manager: "Region-scoped operations",
};

const ROLE_ICONS: Record<AssignableRole, string> = {
  crm_manager: "👥",
  editor: "✏️",
  regional_manager: "🗺️",
};

export function RoleAssigner({ user, onClose }: RoleAssignerProps) {
  const qc = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<AssignableRole[]>([
    ...user.adminRoles,
  ]);
  const [draftPermissionOverrides, setDraftPermissionOverrides] = useState<{
    granted: PermissionKey[];
    denied: PermissionKey[];
  } | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [showGrantedOnly, setShowGrantedOnly] = useState(false);

  const { data: accessData } = useQuery({
    queryKey: ["admin-user-access", user.id],
    queryFn: () => fetchUserAccess(user.id),
  });
  const { data: permissionCatalog } = useQuery({
    queryKey: ["admin-permission-catalog"],
    queryFn: fetchPermissionCatalog,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (roles: AssignableRole[]) => assignRoles(user.id, roles),
    onSuccess: (updated) => {
      qc.setQueryData<{ pages: { users: AdminUser[] }[] }>(
        ["admin-users"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              users: p.users.map((u) =>
                u.id === user.id ? { ...u, adminRoles: updated.adminRoles } : u,
              ),
            })),
          };
        },
      );
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Roles updated for ${user.username ?? user.email}`);
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to update roles"));
    },
  });

  const permissionMutation = useMutation({
    mutationFn: (payload: {
      granted: PermissionKey[];
      denied: PermissionKey[];
    }) => setUserPermissionOverrides(user.id, payload),
    onSuccess: () => {
      setDraftPermissionOverrides(null);
      qc.invalidateQueries({ queryKey: ["admin-user-access", user.id] });
      toast.success("Permission overrides saved");
    },
    onError: (err: unknown) => {
      toast.error(
        getErrorMessage(err, "Failed to update permission overrides"),
      );
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearAllRoles(user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("All roles cleared");
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to clear roles"));
    },
  });

  function toggleRole(role: AssignableRole) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function toggleAccordion(resource: string) {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) next.delete(resource);
      else next.add(resource);
      return next;
    });
  }

  function applyRolePreset(role: string) {
    const preset = permissionCatalog?.roleDefaults[role] ?? [];
    setDraftPermissionOverrides({
      granted: preset as PermissionKey[],
      denied: [],
    });
  }

  const isLoading =
    mutation.isPending ||
    clearMutation.isPending ||
    permissionMutation.isPending;

  const hasRoleChanges =
    JSON.stringify([...selectedRoles].sort()) !==
    JSON.stringify([...user.adminRoles].sort());

  const currentGranted: PermissionKey[] =
    draftPermissionOverrides?.granted ??
    (accessData?.permissionOverrides?.granted as PermissionKey[]) ??
    [];
  const currentDenied: PermissionKey[] =
    draftPermissionOverrides?.denied ??
    (accessData?.permissionOverrides?.denied as PermissionKey[]) ??
    [];

  const hasPermissionChanges =
    JSON.stringify(
      [...(accessData?.permissionOverrides?.granted ?? [])].sort(),
    ) !== JSON.stringify([...currentGranted].sort()) ||
    JSON.stringify(
      [...(accessData?.permissionOverrides?.denied ?? [])].sort(),
    ) !== JSON.stringify([...currentDenied].sort());

  function togglePermission(permission: PermissionKey) {
    const granted = [...currentGranted];
    const denied = [...currentDenied];
    const nextGranted = granted.includes(permission)
      ? granted.filter((p) => p !== permission)
      : [...granted, permission];
    const nextDenied = denied.filter((p) => p !== permission);
    setDraftPermissionOverrides({ granted: nextGranted, denied: nextDenied });
  }

  const accordionData = useMemo(() => {
    if (!permissionCatalog) return [];

    const needle = permissionSearch.trim().toLowerCase();

    // Use permissionsByResource from catalog; fall back to building from allPermissions
    const byResource: Record<
      string,
      Record<string, PermissionKey>
    > = permissionCatalog.permissionsByResource ??
    (() => {
      const map: Record<string, Record<string, PermissionKey>> = {};
      permissionCatalog.allPermissions.forEach((p) => {
        const dot = p.indexOf(".");
        const resource = dot === -1 ? "other" : p.slice(0, dot);
        const action = dot === -1 ? "manage" : p.slice(dot + 1);
        if (!map[resource]) map[resource] = {};
        map[resource][action] = p;
      });
      return map;
    })();

    const preferredActionOrder = [
      "read",
      "create",
      "update",
      "delete",
      "approve",
      "reject",
      "assign",
      "reassign",
      "override",
      "cancel",
      "block",
      "suspend",
      "escalate",
      "resolve",
      "compensate",
      "refund",
      "respond",
      "moderate",
      "flag",
      "monitor",
      "configure",
      "schedule",
      "export",
      "analytics",
      "segment",
      "manage",
      "view",
    ];

    const sortActions = (actions: string[]) =>
      [...actions].sort((a, b) => {
        const ai = preferredActionOrder.indexOf(a);
        const bi = preferredActionOrder.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });

    return Object.entries(byResource)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([resource, actionMap]) => {
        const actions = sortActions(Object.keys(actionMap));
        const permissions = actions.map((a) => ({
          action: a,
          key: actionMap[a],
        }));
        const grantedCount = permissions.filter((p) =>
          currentGranted.includes(p.key),
        ).length;

        // Filter by search
        const matchesSearch =
          !needle ||
          resource.toLowerCase().includes(needle) ||
          permissions.some(
            (p) =>
              p.action.toLowerCase().includes(needle) ||
              p.key.toLowerCase().includes(needle),
          );

        // Filter granted-only
        const visiblePermissions = showGrantedOnly
          ? permissions.filter((p) => currentGranted.includes(p.key))
          : permissions;

        return {
          resource,
          permissions: visiblePermissions,
          grantedCount,
          totalCount: permissions.length,
          matchesSearch,
          hasGranted: grantedCount > 0,
        };
      })
      .filter(
        (item) =>
          item.matchesSearch &&
          item.permissions.length > 0 &&
          (!showGrantedOnly || item.hasGranted),
      );
  }, [permissionCatalog, permissionSearch, showGrantedOnly, currentGranted]);

  const formatLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\./g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showClearConfirm) setShowClearConfirm(false);
        else onClose();
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, showClearConfirm]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-labelledby="assign-roles-title"
        aria-modal="true"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 flex-shrink-0">
          <div>
            <h2
              id="assign-roles-title"
              className="text-base font-semibold text-white"
            >
              Assign access
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {user.username ?? user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
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
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* User info strip */}
          <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 text-sm font-semibold overflow-hidden flex-shrink-0 ring-1 ring-slate-600/50">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.username ?? user.email)[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">
                {user.username ?? "—"}
              </p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
            <span className="text-xs font-medium bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded-lg capitalize flex-shrink-0">
              {user.baseRole}
            </span>
          </div>

          {/* ── § 1  Role pills ──────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-slate-200 text-sm font-semibold">Roles</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Select which modules this user can access
                </p>
              </div>
              {user.adminRoles.length > 0 && !showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={isLoading}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Confirm clear dialog */}
            {showClearConfirm && (
              <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
                <p className="text-red-200 text-sm font-medium mb-2">
                  Remove all roles from this user?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      clearMutation.mutate();
                      setShowClearConfirm(false);
                    }}
                    disabled={isLoading}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 transition-colors"
                  >
                    {clearMutation.isPending ? "Clearing…" : "Yes, remove all"}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isLoading}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Role pill toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ASSIGNABLE_ROLES.map((role) => {
                const isOn = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`relative flex flex-col items-start gap-1 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                      isOn
                        ? "bg-blue-500/12 border-blue-500/50 ring-1 ring-blue-500/25"
                        : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70"
                    }`}
                  >
                    {/* Active indicator dot */}
                    <span
                      className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-colors ${
                        isOn ? "bg-blue-400" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-base leading-none">
                      {ROLE_ICONS[role]}
                    </span>
                    <span className="text-white text-xs font-semibold mt-1">
                      {ROLE_LABELS[role]}
                    </span>
                    <span className="text-slate-500 text-[11px] leading-tight">
                      {ROLE_DESCRIPTIONS[role]}
                    </span>
                    {isOn && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border mt-1 ${ROLE_COLORS[role]}`}
                      >
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div className="border-t border-slate-800" />

          {/* ── § 2  Permission overrides ─────────────────────────────────── */}
          <section>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-slate-200 text-sm font-semibold">
                  Permission overrides
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Fine-tune individual permissions beyond role defaults
                </p>
              </div>
              {currentGranted.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 flex-shrink-0 mt-0.5">
                  {currentGranted.length} granted
                </span>
              )}
            </div>

            {permissionCatalog ? (
              <div className="space-y-3">
                {/* Role preset loader */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500 text-[11px] font-medium uppercase tracking-wide mr-1">
                    Load preset
                  </span>
                  {Object.keys(permissionCatalog.roleDefaults)
                    .filter((r) => r !== "super_admin")
                    .map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => applyRolePreset(role)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors capitalize"
                      >
                        {role.replace(/_/g, " ")}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() =>
                      setDraftPermissionOverrides({ granted: [], denied: [] })
                    }
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Search + filter row */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
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
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Search resource or action…"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                    />
                    {permissionSearch && (
                      <button
                        onClick={() => setPermissionSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                  <button
                    type="button"
                    onClick={() => setShowGrantedOnly((p) => !p)}
                    className={`px-3 py-2 rounded-lg text-[11px] font-medium border transition-colors flex-shrink-0 ${
                      showGrantedOnly
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/35"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {showGrantedOnly ? "✓ Granted only" : "Granted only"}
                  </button>
                </div>

                {/* Accordion — one item per resource */}
                <div className="rounded-xl border border-slate-700/70 overflow-hidden divide-y divide-slate-800">
                  {accordionData.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-500 text-sm">
                      No permissions match your filter.
                    </div>
                  ) : (
                    accordionData.map(
                      ({ resource, permissions, grantedCount, totalCount }) => {
                        const isOpen = openAccordions.has(resource);
                        return (
                          <div key={resource}>
                            {/* Accordion header */}
                            <button
                              type="button"
                              onClick={() => toggleAccordion(resource)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/50 transition-colors group"
                            >
                              {/* Chevron */}
                              <svg
                                className={`w-3.5 h-3.5 text-slate-500 flex-shrink-0 transition-transform duration-200 ${
                                  isOpen ? "rotate-90" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>

                              {/* Resource name */}
                              <span className="text-slate-200 text-sm font-medium flex-1 group-hover:text-white transition-colors">
                                {formatLabel(resource)}
                              </span>

                              {/* Granted / total counts */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {grantedCount > 0 ? (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                    {grantedCount}/{totalCount}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-600">
                                    {totalCount} actions
                                  </span>
                                )}
                              </div>
                            </button>

                            {/* Accordion body */}
                            {isOpen && (
                              <div className="bg-slate-950/40 px-4 pb-3 pt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                  {permissions.map(({ action, key }) => {
                                    const isGranted =
                                      currentGranted.includes(key);
                                    return (
                                      <div
                                        key={key}
                                        className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span
                                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                              isGranted
                                                ? "bg-emerald-400"
                                                : "bg-slate-700"
                                            }`}
                                          />
                                          <span className="text-xs text-slate-300 truncate">
                                            {formatLabel(action)}
                                          </span>
                                        </div>
                                        {/* Toggle */}
                                        <button
                                          type="button"
                                          onClick={() => togglePermission(key)}
                                          title={key}
                                          className={`relative inline-flex h-5 w-9 items-center rounded-full flex-shrink-0 transition-all duration-150 ${
                                            isGranted
                                              ? "bg-emerald-500"
                                              : "bg-slate-700 hover:bg-slate-600"
                                          }`}
                                          aria-pressed={isGranted}
                                          aria-label={`Toggle ${key}`}
                                        >
                                          <span
                                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                                              isGranted
                                                ? "translate-x-[18px]"
                                                : "translate-x-[3px]"
                                            }`}
                                          />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              </div>
            ) : (
              /* Loading skeleton */
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-11 rounded-xl bg-slate-800/50 animate-pulse"
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Sticky footer ───────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-slate-800 px-6 py-4 bg-slate-900/95">
          <div className="flex items-center gap-2">
            {/* Cancel */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>

            <div className="flex-1" />

            {/* Save permissions */}
            <button
              onClick={() =>
                permissionMutation.mutate({
                  granted: currentGranted,
                  denied: currentDenied,
                })
              }
              disabled={isLoading || !hasPermissionChanges}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              {permissionMutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving…
                </span>
              ) : (
                `Save permissions${currentGranted.length > 0 ? ` (${currentGranted.length})` : ""}`
              )}
            </button>

            {/* Save roles — primary action */}
            <button
              onClick={() => mutation.mutate(selectedRoles)}
              disabled={isLoading || !hasRoleChanges}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving…
                </span>
              ) : (
                `Save roles${selectedRoles.length > 0 ? ` (${selectedRoles.length})` : ""}`
              )}
            </button>
          </div>

          <p className="text-slate-700 text-[11px] text-center mt-3">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-500 font-mono text-[10px]">
              Esc
            </kbd>{" "}
            to close
          </p>
        </div>
      </div>
    </div>
  );
}
