import { api } from "@/shared/config/axios";

const BASE = "/captains";

// ─── List & Stats ─────────────────────────────────────────────────────────────

export const fetchCaptainStats = () =>
  api.get(`${BASE}/stats`).then((r) => r.data);

export const fetchCaptains = (params?: {
  search?: string;
  onboardingStatus?: string;
  availability?: string;
  serviceArea?: string;
  page?: number;
  limit?: number;
}) => api.get(`${BASE}/`, { params }).then((r) => r.data);

// ─── Profile ──────────────────────────────────────────────────────────────────

export const fetchCaptain = (captainId: string) =>
  api.get(`${BASE}/${captainId}`).then((r) => r.data);

export const updateCaptainInfo = (
  captainId: string,
  patch: Record<string, unknown>,
) => api.patch(`${BASE}/${captainId}/info`, patch).then((r) => r.data);

export const updateCaptainDocuments = (
  captainId: string,
  patch: Record<string, unknown>,
) => api.patch(`${BASE}/${captainId}/documents`, patch).then((r) => r.data);

// ─── Onboarding Actions ───────────────────────────────────────────────────────

export const approveCaptain = (captainId: string, notes?: string) =>
  api.patch(`${BASE}/${captainId}/approve`, { notes }).then((r) => r.data);

export const rejectCaptain = (captainId: string, reason: string) =>
  api.patch(`${BASE}/${captainId}/reject`, { reason }).then((r) => r.data);

export const suspendCaptain = (captainId: string, reason: string) =>
  api.patch(`${BASE}/${captainId}/suspend`, { reason }).then((r) => r.data);

export const reactivateCaptain = (captainId: string) =>
  api.patch(`${BASE}/${captainId}/reactivate`).then((r) => r.data);

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const fetchCaptainWallet = (captainId: string) =>
  api.get(`${BASE}/${captainId}/wallet`).then((r) => r.data);

export const fetchCaptainTransactions = (
  captainId: string,
  params?: { type?: string; status?: string; page?: number; limit?: number },
) =>
  api.get(`${BASE}/${captainId}/transactions`, { params }).then((r) => r.data);

export const fetchCaptainWalletAnalytics = (captainId: string) =>
  api.get(`${BASE}/${captainId}/wallet/analytics`).then((r) => r.data);

// ─── Live Orders & History ────────────────────────────────────────────────────

export const fetchCaptainLiveOrders = (captainId: string) =>
  api.get(`${BASE}/${captainId}/live-orders`).then((r) => r.data);

export const fetchCaptainHistory = (
  captainId: string,
  params?: { serviceType?: string; page?: number; limit?: number },
) => api.get(`${BASE}/${captainId}/history`, { params }).then((r) => r.data);

// ─── Settlements ──────────────────────────────────────────────────────────────

export const fetchCaptainSettlements = (params?: {
  status?: string;
  captainId?: string;
  page?: number;
  limit?: number;
}) => api.get(`${BASE}/settlements`, { params }).then((r) => r.data);

export const approveSettlement = (settlementId: string) =>
  api.patch(`${BASE}/settlements/${settlementId}/approve`).then((r) => r.data);

export const rejectSettlement = (settlementId: string, reason: string) =>
  api
    .patch(`${BASE}/settlements/${settlementId}/reject`, { reason })
    .then((r) => r.data);
