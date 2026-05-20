/**
 * usePermission — PBAC-aware permission hooks for the frontend.
 *
 * These hooks read the JWT-embedded permissions that were built at login
 * from the DB `policies` + `rolepermissons` collections (via the backend
 * PBAC engine). Backend always re-validates — these hooks are purely for
 * conditional UI rendering, not for security enforcement.
 *
 * Usage:
 *   const canReadCustomers = usePermission('customers.read');
 *   const canManageCoupons = useAllPermissions(['coupons.create', 'coupons.update']);
 */
import { useAuthStore } from "@/store/auth/authStore";

/** Returns true if the current user has the given permission. */
export function usePermission(permission: string): boolean {
  return useAuthStore((s) => s.hasPermission(permission));
}

/** Returns true if the current user has ALL of the listed permissions. */
export function useAllPermissions(permissions: string[]): boolean {
  return useAuthStore((s) => s.hasAllPermissions(permissions));
}

/** Returns true if the current user has ANY of the listed permissions. */
export function useAnyPermission(permissions: string[]): boolean {
  return useAuthStore((s) => s.hasAnyPermission(permissions));
}

/**
 * Returns an object with boolean flags for each permission in the map.
 *
 * @example
 * const perms = usePermissions({
 *   canRead:   'customers.read',
 *   canBlock:  'customers.block',
 *   canExport: 'customers.export',
 * });
 * if (perms.canExport) { ... }
 */
export function usePermissions<K extends string>(
  permissionMap: Record<K, string>,
): Record<K, boolean> {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  return Object.fromEntries(
    Object.entries(permissionMap).map(([key, perm]) => [
      key,
      hasPermission(perm as string),
    ]),
  ) as Record<K, boolean>;
}
