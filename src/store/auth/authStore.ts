/**
 * Auth Store — Global authentication state
 *
 * Persisted to localStorage. Used by guards, layout, and login flow.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BaseRole = "user" | "vendor" | "admin" | "super_admin" | "captain";
export type AssignableRole = "crm_manager" | "editor" | "regional_manager";

export interface AuthUser {
  id: string;
  username?: string;
  email: string;
  role: BaseRole;
  roles: AssignableRole[];
  /** Effective permissions from PBAC (JWT-embedded, built at login from DB policies). */
  permissions?: string[];
  region?: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
  isAdmin: () => boolean;
  hasRole: (role: AssignableRole) => boolean;
  hasAnyRole: (roles: AssignableRole[]) => boolean;
  /** Check if the authenticated user has a specific PBAC permission. */
  hasPermission: (permission: string) => boolean;
  /** Check if the authenticated user has all of the listed permissions. */
  hasAllPermissions: (permissions: string[]) => boolean;
  /** Check if the authenticated user has any of the listed permissions. */
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        set({ user, tokens, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      isAdmin: () => {
        const role = get().user?.role;
        return role === "admin" || role === "super_admin";
      },

      hasRole: (role) => (get().user?.roles ?? []).includes(role),

      hasAnyRole: (roles) =>
        roles.some((r) => (get().user?.roles ?? []).includes(r)),

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === "admin" || user.role === "super_admin") return true;
        return (user.permissions ?? []).includes(permission);
      },

      hasAllPermissions: (permissions) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === "admin" || user.role === "super_admin") return true;
        const granted = user.permissions ?? [];
        return permissions.every((p) => granted.includes(p));
      },

      hasAnyPermission: (permissions) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === "admin" || user.role === "super_admin") return true;
        const granted = user.permissions ?? [];
        return permissions.some((p) => granted.includes(p));
      },
    }),
    {
      name: "crm-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
