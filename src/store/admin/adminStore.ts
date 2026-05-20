/**
 * Admin Store — Client state for Admin Console
 */
import { create } from "zustand";

interface AdminState {
  // User list
  userFilters: { search: string; page: number; limit: number };
  setUserSearch: (v: string) => void;
  setUserPage: (p: number) => void;
  setUserLimit: (l: number) => void;

  // Role assigner modal
  roleAssignerUserId: string | null;
  openRoleAssigner: (userId: string) => void;
  closeRoleAssigner: () => void;

  // Invitations
  invitationFilters: { status?: string; page: number; limit: number };
  setInvitationStatus: (v?: string) => void;
  setInvitationPage: (p: number) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  userFilters: { search: "", page: 1, limit: 20 },
  setUserSearch: (v) =>
    set((s) => ({
      userFilters: { ...s.userFilters, search: v, page: 1 },
    })),
  setUserPage: (p) =>
    set((s) => ({ userFilters: { ...s.userFilters, page: p } })),
  setUserLimit: (l) =>
    set((s) => ({ userFilters: { ...s.userFilters, limit: l, page: 1 } })),

  roleAssignerUserId: null,
  openRoleAssigner: (userId) => set({ roleAssignerUserId: userId }),
  closeRoleAssigner: () => set({ roleAssignerUserId: null }),

  invitationFilters: { page: 1, limit: 20 },
  setInvitationStatus: (v) =>
    set((s) => ({
      invitationFilters: { ...s.invitationFilters, status: v, page: 1 },
    })),
  setInvitationPage: (p) =>
    set((s) => ({
      invitationFilters: { ...s.invitationFilters, page: p },
    })),
}));
