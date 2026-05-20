/**
 * Regional Manager API
 * All calls go to /api/v1/regional/*
 */
import { api } from "@/shared/config/axios";
import type {
  ApiResponse,
  RegionalDashboard,
  RegionalVendor,
  TechnicianDetail,
  TechnicianWorkload,
  TechnicianPerformance,
  RegionalSR,
  SlaReport,
  RegionalAnalytics,
  RegionalFinance,
  ResourcePlanning,
  RegionalCampaign,
  GrowthOpportunities,
  RegionalBenchmark,
  RegionalCustomer,
  LoyaltyInsights,
} from "../types";

const BASE = "/regional";

// ─── §1 Dashboard ────────────────────────────────────────────────────────────

export const fetchDashboard = (params?: { region?: string }) =>
  api
    .get<ApiResponse<RegionalDashboard>>(`${BASE}/dashboard`, { params })
    .then((r) => r.data);

// ─── §2 Technicians ──────────────────────────────────────────────────────────

export const fetchTechnicians = (params?: {
  region?: string;
  search?: string;
  onboardingStatus?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<RegionalVendor[]>>(`${BASE}/technicians`, { params })
    .then((r) => r.data);

export const fetchTechnicianDetail = (
  vendorId: string,
  params?: { region?: string },
) =>
  api
    .get<
      ApiResponse<TechnicianDetail>
    >(`${BASE}/technicians/${vendorId}`, { params })
    .then((r) => r.data);

export const fetchTechnicianWorkload = (params?: { region?: string }) =>
  api
    .get<
      ApiResponse<TechnicianWorkload[]>
    >(`${BASE}/technicians/workload`, { params })
    .then((r) => r.data);

export const fetchTechnicianPerformance = (
  vendorId: string,
  params?: { region?: string; from?: string; to?: string },
) =>
  api
    .get<
      ApiResponse<TechnicianPerformance>
    >(`${BASE}/technicians/${vendorId}/performance`, { params })
    .then((r) => r.data);

// ─── §3 SLA ──────────────────────────────────────────────────────────────────

export const fetchSlaReport = (params?: { region?: string }) =>
  api
    .get<ApiResponse<SlaReport>>(`${BASE}/sla`, { params })
    .then((r) => r.data);

// ─── §2 Service Requests ─────────────────────────────────────────────────────

export const fetchServiceRequests = (params?: {
  region?: string;
  status?: string;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<RegionalSR[]>>(`${BASE}/service-requests`, { params })
    .then((r) => r.data);

export const assignServiceRequest = (
  requestId: string,
  payload: { vendorId: string; region?: string },
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}/assign`, payload)
    .then((r) => r.data);

export const reassignServiceRequest = (
  requestId: string,
  payload: { vendorId: string; reason: string; region?: string },
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}/reassign`, payload)
    .then((r) => r.data);

export const cancelServiceRequest = (
  requestId: string,
  payload: { reason: string; region?: string },
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}/cancel`, payload)
    .then((r) => r.data);

export const tagServiceRequest = (
  requestId: string,
  payload: { tag: string; region?: string },
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}/tag`, payload)
    .then((r) => r.data);

// ─── §4 Customer Insights ────────────────────────────────────────────────────

export const fetchCustomerInsights = (params?: {
  region?: string;
  page?: number;
  limit?: number;
}) =>
  api
    .get<
      ApiResponse<RegionalCustomer[]>
    >(`${BASE}/customer-insights`, { params })
    .then((r) => r.data);

export const fetchLoyaltyInsights = (params?: { region?: string }) =>
  api
    .get<ApiResponse<LoyaltyInsights>>(`${BASE}/loyalty-insights`, { params })
    .then((r) => r.data);

// ─── §5 Analytics ────────────────────────────────────────────────────────────

export const fetchAnalytics = (params?: {
  region?: string;
  from?: string;
  to?: string;
}) =>
  api
    .get<ApiResponse<RegionalAnalytics>>(`${BASE}/analytics`, { params })
    .then((r) => r.data);

// ─── §6 Resource Planning ────────────────────────────────────────────────────

export const fetchResourcePlanning = (params?: { region?: string }) =>
  api
    .get<ApiResponse<ResourcePlanning>>(`${BASE}/resource-planning`, { params })
    .then((r) => r.data);

// ─── §7 Campaigns ────────────────────────────────────────────────────────────

export const fetchCampaigns = (params?: {
  region?: string;
  status?: string;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<RegionalCampaign[]>>(`${BASE}/campaigns`, { params })
    .then((r) => r.data);

export const reviewCampaign = (
  campaignId: string,
  payload: {
    action: "approve" | "reject";
    rejectionReason?: string;
    region?: string;
  },
) =>
  api
    .patch<
      ApiResponse<RegionalCampaign>
    >(`${BASE}/campaigns/${campaignId}/review`, payload)
    .then((r) => r.data);

// ─── §8 Finance ──────────────────────────────────────────────────────────────

export const fetchFinance = (params?: {
  region?: string;
  from?: string;
  to?: string;
}) =>
  api
    .get<ApiResponse<RegionalFinance>>(`${BASE}/finance`, { params })
    .then((r) => r.data);

export const fetchProfitability = (params?: {
  region?: string;
  from?: string;
  to?: string;
}) =>
  api
    .get<ApiResponse<unknown[]>>(`${BASE}/finance/profitability`, { params })
    .then((r) => r.data);

// ─── §9 Audit ────────────────────────────────────────────────────────────────

export const fetchAuditLogs = (params?: { page?: number; limit?: number }) =>
  api
    .get<ApiResponse<unknown[]>>(`${BASE}/audit-logs`, { params })
    .then((r) => r.data);

// ─── §10 Strategic ───────────────────────────────────────────────────────────

export const fetchGrowthOpportunities = (params?: { region?: string }) =>
  api
    .get<
      ApiResponse<GrowthOpportunities>
    >(`${BASE}/strategic/growth`, { params })
    .then((r) => r.data);

export const fetchBenchmark = (params?: {
  region?: string;
  from?: string;
  to?: string;
}) =>
  api
    .get<
      ApiResponse<RegionalBenchmark>
    >(`${BASE}/strategic/benchmark`, { params })
    .then((r) => r.data);
