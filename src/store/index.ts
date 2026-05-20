/**
 * Centralized State Management
 *
 * - auth: Authentication (persisted)
 * - ui: Global UI (sidebar, theme)
 * - crm: CRM Manager filters, modals, pagination
 * - regional: Regional Manager filters, modals
 * - admin: Admin Console filters, role assigner
 *
 * Server data (API responses) stays in React Query via feature hooks.
 */
export { useAuthStore } from "./auth/authStore";
export type {
  AuthUser,
  AuthTokens,
  BaseRole,
  AssignableRole,
} from "./auth/authStore";

export { useUIStore } from "./ui/uiStore";

export { useCRMStore } from "./crm/crmStore";

export { useRegionalStore } from "./regional/regionalStore";

export { useAdminStore } from "./admin/adminStore";
