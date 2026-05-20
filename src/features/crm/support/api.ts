import { api } from "@/shared/config/axios";

const BASE = "/crm/support";

// ─── Sessions ────────────────────────────────────────────────────────────────

export const fetchSupportSessions = (params?: {
  status?: string | string[];
  page?: number;
  limit?: number;
}) =>
  api
    .get(`${BASE}/sessions`, {
      params,
      paramsSerializer: { indexes: null },
    })
    .then((r) => r.data);

export const fetchSupportSession = (sessionId: string) =>
  api.get(`${BASE}/sessions/${sessionId}`).then((r) => r.data);

export const assignSupportSession = (sessionId: string) =>
  api.post(`${BASE}/sessions/${sessionId}/assign`).then((r) => r.data);

export const sendCrmMessage = (sessionId: string, content: string) =>
  api
    .post(`${BASE}/sessions/${sessionId}/message`, { content })
    .then((r) => r.data);

export const resolveSupportSession = (sessionId: string, note?: string) =>
  api
    .post(`${BASE}/sessions/${sessionId}/resolve`, { note })
    .then((r) => r.data);

// ─── Change Requests ─────────────────────────────────────────────────────────

export const fetchChangeRequests = (params?: {
  status?: string | string[];
  page?: number;
  limit?: number;
}) =>
  api
    .get(`${BASE}/change-requests`, {
      params,
      paramsSerializer: { indexes: null },
    })
    .then((r) => r.data);

export const fetchChangeRequest = (id: string) =>
  api.get(`${BASE}/change-requests/${id}`).then((r) => r.data);

export const approveChangeRequest = (id: string, note?: string) =>
  api
    .post(`${BASE}/change-requests/${id}/approve`, { note })
    .then((r) => r.data);

export const rejectChangeRequest = (id: string, reason: string) =>
  api
    .post(`${BASE}/change-requests/${id}/reject`, { reason })
    .then((r) => r.data);
