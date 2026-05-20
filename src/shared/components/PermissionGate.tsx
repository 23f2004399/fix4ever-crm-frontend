/**
 * PermissionGate — Conditionally renders children based on PBAC permissions.
 *
 * Backend is always the enforcement authority. This component is
 * purely for UI — it hides/shows elements based on the JWT permissions
 * the user received at login.
 *
 * Usage:
 *   <PermissionGate permission="customers.block">
 *     <BlockButton />
 *   </PermissionGate>
 *
 *   <PermissionGate anyOf={['coupons.create', 'coupons.update']} fallback={<ReadOnlyBadge />}>
 *     <EditCouponForm />
 *   </PermissionGate>
 */
import { ReactNode } from "react";
import {
  usePermission,
  useAllPermissions,
  useAnyPermission,
} from "@/shared/hooks/usePermission";

interface PermissionGateProps {
  /** Single permission required */
  permission?: string;
  /** All listed permissions required */
  allOf?: string[];
  /** At least one of the listed permissions required */
  anyOf?: string[];
  /** Rendered when access is denied (optional, defaults to null) */
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  allOf,
  anyOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const singleOk = usePermission(permission ?? "");
  const allOk = useAllPermissions(allOf ?? []);
  const anyOk = useAnyPermission(anyOf ?? []);

  // If no constraints are specified, always render
  if (!permission && !allOf?.length && !anyOf?.length) return <>{children}</>;

  let allowed = true;
  if (permission) allowed = allowed && singleOk;
  if (allOf?.length) allowed = allowed && allOk;
  if (anyOf?.length) allowed = allowed && anyOk;

  return allowed ? <>{children}</> : <>{fallback}</>;
}
