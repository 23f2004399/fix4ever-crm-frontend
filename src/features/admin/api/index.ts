/**
 * Admin API
 *
 * Functions for admin-only endpoints: user management, role assignment,
 * and invitation CRUD. Uses the shared axios instance (token auto-injected).
 */
import { api } from "@/shared/config/axios";
import type { AuthUser } from "@/features/auth/types";
import type {
  AdminUser,
  UserRolesResponse,
  AssignableRole,
  PermissionCatalog,
  UserAccessSummary,
  PermissionKey,
} from "../types";

/** Standard API response wrapper from backend */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Raw shape returned by the backend User document.
 * Backend uses `_id`, `role`, and `roles` — frontend uses `id`, `baseRole`, `adminRoles`.
 */
interface RawUser {
  _id?: string;
  id?: string;
  email: string;
  username?: string;
  role: string;
  roles?: AssignableRole[];
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
}

/** Maps a raw backend user document to the typed AdminUser shape. */
function toAdminUser(raw: RawUser): AdminUser {
  return {
    id: raw._id ?? raw.id ?? "",
    email: raw.email,
    username: raw.username,
    baseRole: raw.role,
    adminRoles: raw.roles ?? [],
    isActive: raw.isActive,
    avatar: raw.avatar,
    createdAt: raw.createdAt ?? "",
  };
}

/** Maps the backend role response (after assign/clear) to UserRolesResponse. */
function toUserRolesResponse(raw: RawUser): UserRolesResponse {
  return {
    id: raw._id ?? raw.id ?? "",
    email: raw.email,
    username: raw.username,
    baseRole: raw.role,
    adminRoles: raw.roles ?? [],
  };
}

export async function fetchUsers(
  page = 1,
  limit = 20,
): Promise<{
  users: AdminUser[];
  pagination: ApiResponse<AdminUser[]>["pagination"];
}> {
  const res = await api.get<ApiResponse<RawUser[]>>("/admin/users", {
    params: { page, limit },
  });
  return {
    users: (res.data.data ?? []).map(toAdminUser),
    pagination: res.data.pagination,
  };
}

export async function fetchUserRoles(
  userId: string,
): Promise<UserRolesResponse> {
  const res = await api.get<ApiResponse<RawUser>>(
    `/admin/users/${userId}/roles`,
  );
  return toUserRolesResponse(res.data.data);
}

export async function assignRoles(
  userId: string,
  roles: AssignableRole[],
): Promise<UserRolesResponse> {
  const res = await api.patch<ApiResponse<RawUser>>(
    `/admin/users/${userId}/roles`,
    { roles },
  );
  return toUserRolesResponse(res.data.data);
}

export async function removeRole(
  userId: string,
  role: AssignableRole,
): Promise<UserRolesResponse> {
  const res = await api.patch<ApiResponse<RawUser>>(
    `/admin/users/${userId}/remove-role`,
    { role },
  );
  return toUserRolesResponse(res.data.data);
}

export async function clearAllRoles(
  userId: string,
): Promise<UserRolesResponse> {
  const res = await api.delete<ApiResponse<RawUser>>(
    `/admin/users/${userId}/roles`,
  );
  return toUserRolesResponse(res.data.data);
}

export async function fetchPermissionCatalog(): Promise<PermissionCatalog> {
  const res = await api.get<ApiResponse<PermissionCatalog>>(
    "/admin/users/permissions/catalog",
  );
  return res.data.data;
}

export async function fetchUserAccess(
  userId: string,
): Promise<UserAccessSummary> {
  const res = await api.get<ApiResponse<UserAccessSummary>>(
    `/admin/users/${userId}/access`,
  );
  return res.data.data;
}

export async function setUserPermissionOverrides(
  userId: string,
  payload: { granted: PermissionKey[]; denied: PermissionKey[] },
): Promise<unknown> {
  const res = await api.patch<ApiResponse<unknown>>(
    `/admin/users/${userId}/permissions`,
    payload,
  );
  return res.data.data;
}

// ─── Invitations ──────────────────────────────────────────────
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Invitation {
  id: string;
  email: string;
  roles: AssignableRole[];
  status: InvitationStatus;
  invitedByName?: string;
  invitedBy?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface CreateInvitationPayload {
  email: string;
  roles: AssignableRole[];
}

export interface CreateInvitationResponse {
  id: string;
  email: string;
  roles: AssignableRole[];
  status: string;
  expiresAt: string;
  inviteLink: string;
  message: string;
}

export async function createInvitation(
  payload: CreateInvitationPayload,
): Promise<CreateInvitationResponse> {
  const res = await api.post<ApiResponse<CreateInvitationResponse>>(
    "/admin/invitations",
    payload,
  );
  return res.data.data;
}

export async function fetchInvitations(
  page = 1,
  limit = 20,
  status?: InvitationStatus,
): Promise<{
  invitations: Invitation[];
  pagination: ApiResponse<Invitation[]>["pagination"];
}> {
  const res = await api.get<ApiResponse<Invitation[]>>("/admin/invitations", {
    params: { page, limit, status },
  });
  return { invitations: res.data.data, pagination: res.data.pagination };
}

export async function cancelInvitation(
  id: string,
): Promise<{ message: string; status: string }> {
  const res = await api.delete<
    ApiResponse<{ message: string; status: string }>
  >(`/admin/invitations/${id}`);
  return res.data.data;
}

export async function resendInvitation(
  id: string,
): Promise<{ inviteLink: string; expiresAt: string; message: string }> {
  const res = await api.post<
    ApiResponse<{ inviteLink: string; expiresAt: string; message: string }>
  >(`/admin/invitations/${id}/resend`);
  return res.data.data;
}

// Public (no auth)
export async function getInvitationByToken(token: string): Promise<{
  email: string;
  roles: AssignableRole[];
  invitedByName: string;
  expiresAt: string;
}> {
  const res = await api.get<
    ApiResponse<{
      email: string;
      roles: AssignableRole[];
      invitedByName: string;
      expiresAt: string;
    }>
  >(`/auth/invite/${token}`);
  return res.data.data;
}

export async function acceptInvitation(
  token: string,
  password: string,
  username: string,
): Promise<{
  user: AuthUser;
  tokens: { accessToken: string; refreshToken: string };
}> {
  const res = await api.post<
    ApiResponse<{
      user: AuthUser;
      tokens: { accessToken: string; refreshToken: string };
    }>
  >(`/auth/invite/${token}/accept`, { password, username });
  return res.data.data;
}
