/**
 * CRM Store — Client state for CRM Manager feature
 *
 * Filters, pagination, modal state. Server data stays in React Query.
 */
import { create } from "zustand";

// ─── Customers ────────────────────────────────────────────────────────────────

interface CustomerFilters {
  search: string;
  isActive: boolean | undefined;
}

interface CRMState {
  // Customers
  customerFilters: CustomerFilters;
  setCustomerSearch: (v: string) => void;
  setCustomerIsActive: (v: boolean | undefined) => void;
  resetCustomerFilters: () => void;

  // Service Requests
  srFilters: { status: string; priority: string; search: string };
  srPage: number;
  setSRFilter: (key: "status" | "priority" | "search", value: string) => void;
  setSRPage: (p: number) => void;
  resetSRFilters: () => void;

  // Campaigns
  campaignStatusFilter: string;
  setCampaignStatusFilter: (v: string) => void;

  // Tickets
  ticketFilters: { status: string; priority: string };
  ticketPage: number;
  setTicketFilter: (key: "status" | "priority", value: string) => void;
  setTicketPage: (p: number) => void;

  // Reviews
  reviewFilters: { minRating?: number; maxRating?: number };
  reviewPage: number;
  setReviewFilter: (key: "minRating" | "maxRating", value?: number) => void;
  setReviewRatingFilter: (rating?: number) => void;
  setReviewPage: (p: number) => void;

  // Modals (controlled by store for cross-component access)
  escalateModal: { requestId: string; note: string } | null;
  openEscalateModal: (requestId: string) => void;
  closeEscalateModal: () => void;
  setEscalateNote: (note: string) => void;

  // SR detail modal (View More)
  viewDetailRequestId: string | null;
  openSRDetailModal: (requestId: string) => void;
  closeSRDetailModal: () => void;

  // SR edit drawer
  editSRId: string | null;
  openSREditDrawer: (requestId: string) => void;
  closeSREditDrawer: () => void;
}

const defaultCustomerFilters: CustomerFilters = {
  search: "",
  isActive: undefined,
};

const defaultSRFilters = { status: "", priority: "", search: "" };
const defaultTicketFilters = { status: "", priority: "" };

export const useCRMStore = create<CRMState>((set) => ({
  customerFilters: defaultCustomerFilters,
  setCustomerSearch: (v) =>
    set((s) => ({
      customerFilters: { ...s.customerFilters, search: v },
    })),
  setCustomerIsActive: (v) =>
    set((s) => ({
      customerFilters: { ...s.customerFilters, isActive: v },
    })),
  resetCustomerFilters: () => set({ customerFilters: defaultCustomerFilters }),

  srFilters: defaultSRFilters,
  srPage: 1,
  setSRFilter: (key, value) =>
    set((s) => ({
      srFilters: { ...s.srFilters, [key]: value },
      srPage: 1,
    })),
  setSRPage: (p) => set({ srPage: p }),
  resetSRFilters: () => set({ srFilters: defaultSRFilters, srPage: 1 }),

  campaignStatusFilter: "",
  setCampaignStatusFilter: (v) => set({ campaignStatusFilter: v }),

  ticketFilters: defaultTicketFilters,
  ticketPage: 1,
  setTicketFilter: (key, value) =>
    set((s) => ({
      ticketFilters: { ...s.ticketFilters, [key]: value },
      ticketPage: 1,
    })),
  setTicketPage: (p) => set({ ticketPage: p }),

  reviewFilters: {},
  reviewPage: 1,
  setReviewFilter: (key, value) =>
    set((s) => ({
      reviewFilters: { ...s.reviewFilters, [key]: value },
      reviewPage: 1,
    })),
  setReviewRatingFilter: (rating) =>
    set({
      reviewFilters: { minRating: rating, maxRating: rating },
      reviewPage: 1,
    }),
  setReviewPage: (p) => set({ reviewPage: p }),

  escalateModal: null,
  openEscalateModal: (requestId) =>
    set({ escalateModal: { requestId, note: "" } }),
  closeEscalateModal: () => set({ escalateModal: null }),
  setEscalateNote: (note) =>
    set((s) =>
      s.escalateModal ? { escalateModal: { ...s.escalateModal, note } } : s,
    ),

  viewDetailRequestId: null,
  openSRDetailModal: (requestId) => set({ viewDetailRequestId: requestId }),
  closeSRDetailModal: () => set({ viewDetailRequestId: null }),

  editSRId: null,
  openSREditDrawer: (requestId) => set({ editSRId: requestId }),
  closeSREditDrawer: () => set({ editSRId: null }),
}));
