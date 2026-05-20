export type BaseRole = "user" | "vendor" | "admin" | "super_admin" | "captain";
export type AssignableRole = "crm_manager" | "editor" | "regional_manager";

export interface AuthUser {
  id: string;
  username?: string;
  email: string;
  role: BaseRole;
  roles: AssignableRole[];
  /** JWT-embedded permissions from PBAC engine (empty for admin/super_admin — they bypass checks). */
  permissions?: string[];
  region?: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}
