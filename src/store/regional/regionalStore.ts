/**
 * Regional Store — Client state for Regional Manager feature
 */
import { create } from "zustand";

interface RegionalState {
  // Technicians
  technicianFilters: {
    search: string;
    onboardingStatus: string;
    minRating: number | undefined;
  };
  technicianPage: number;
  setTechnicianFilter: (
    key: "search" | "onboardingStatus" | "minRating",
    value: string | number | undefined,
  ) => void;
  setTechnicianPage: (p: number) => void;

  // Service Requests
  srFilters: { status: string };
  srPage: number;
  setSRFilter: (key: "status", value: string) => void;
  setSRPage: (p: number) => void;

  // Campaigns
  campaignStatusFilter: string;
  setCampaignStatusFilter: (v: string) => void;

  // SR action modals
  assignModal: { requestId: string } | null;
  reassignModal: { requestId: string; vendorId: string; reason: string } | null;
  cancelModal: { requestId: string; reason: string } | null;
  openAssignModal: (requestId: string) => void;
  closeAssignModal: () => void;
  openReassignModal: (requestId: string) => void;
  closeReassignModal: () => void;
  setReassignData: (vendorId: string, reason: string) => void;
  openCancelModal: (requestId: string) => void;
  closeCancelModal: () => void;
  setCancelReason: (reason: string) => void;
}

const defaultTechFilters = {
  search: "",
  onboardingStatus: "",
  minRating: undefined as number | undefined,
};

export const useRegionalStore = create<RegionalState>((set) => ({
  technicianFilters: defaultTechFilters,
  technicianPage: 1,
  setTechnicianFilter: (key, value) =>
    set((s) => ({
      technicianFilters: { ...s.technicianFilters, [key]: value },
      technicianPage: 1,
    })),
  setTechnicianPage: (p) => set({ technicianPage: p }),

  srFilters: { status: "" },
  srPage: 1,
  setSRFilter: (key, value) =>
    set((s) => ({
      srFilters: { ...s.srFilters, [key]: value },
      srPage: 1,
    })),
  setSRPage: (p) => set({ srPage: p }),

  campaignStatusFilter: "",
  setCampaignStatusFilter: (v) => set({ campaignStatusFilter: v }),

  assignModal: null,
  reassignModal: null,
  cancelModal: null,
  openAssignModal: (requestId) => set({ assignModal: { requestId } }),
  closeAssignModal: () => set({ assignModal: null }),
  openReassignModal: (requestId) =>
    set({
      reassignModal: { requestId, vendorId: "", reason: "" },
    }),
  closeReassignModal: () => set({ reassignModal: null }),
  setReassignData: (vendorId, reason) =>
    set((s) =>
      s.reassignModal
        ? { reassignModal: { ...s.reassignModal, vendorId, reason } }
        : s,
    ),
  openCancelModal: (requestId) =>
    set({ cancelModal: { requestId, reason: "" } }),
  closeCancelModal: () => set({ cancelModal: null }),
  setCancelReason: (reason) =>
    set((s) =>
      s.cancelModal ? { cancelModal: { ...s.cancelModal, reason } } : s,
    ),
}));
