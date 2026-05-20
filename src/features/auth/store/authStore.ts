/**
 * Re-exports auth store from centralized store.
 * Use: import { useAuthStore } from "@/store" or "@/features/auth/store/authStore"
 */
export {
  useAuthStore,
  type AuthUser,
  type AuthTokens,
  type BaseRole,
  type AssignableRole,
} from "@/store/auth/authStore";
