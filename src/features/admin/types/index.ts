export type AssignableRole = "crm_manager" | "editor" | "regional_manager";

export const ASSIGNABLE_ROLES: AssignableRole[] = [
  "crm_manager",
  "editor",
  "regional_manager",
];

export const ROLE_LABELS: Record<AssignableRole, string> = {
  crm_manager: "CRM Manager",
  editor: "Editor",
  regional_manager: "Regional Manager",
};

export const ROLE_COLORS: Record<AssignableRole, string> = {
  crm_manager: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  editor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  regional_manager: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

export const BASE_ROLE_COLORS: Record<string, string> = {
  user: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  vendor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  admin: "bg-red-500/15 text-red-400 border-red-500/30",
  captain: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

export interface AdminUser {
  id: string;
  username?: string;
  email: string;
  baseRole: string;
  adminRoles: AssignableRole[];
  isActive: boolean;
  avatar?: string;
  createdAt: string;
}

export interface UserRolesResponse {
  id: string;
  email: string;
  username?: string;
  baseRole: string;
  adminRoles: AssignableRole[];
}

export type PermissionKey = string;

export interface UserAccessSummary {
  userId: string;
  email: string;
  username?: string;
  baseRole: string;
  assignedRoles: AssignableRole[];
  region?: string;
  permissionOverrides: {
    granted: PermissionKey[];
    denied: PermissionKey[];
  };
  effectivePermissions: PermissionKey[];
  isActive: boolean;
}

export interface PermissionCatalog {
  /** Every unique permission value, deduplicated and sorted. */
  allPermissions: PermissionKey[];
  /** Suggested starting-point permission set per role (not system-enforced). */
  roleDefaults: Record<string, PermissionKey[]>;
  /**
   * All permissions grouped by resource module, keyed by action name.
   * Actions include standard CRUD (create/read/update/delete) plus domain
   * actions (approve, reject, block, monitor, escalate, export, …).
   */
  permissionsByResource: Record<string, Record<string, PermissionKey>>;
  /** @deprecated Use permissionsByResource — kept for backward compatibility. */
  crudByResource?: Record<string, Record<string, PermissionKey>>;
}

export interface PaginatedUsers {
  data: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
