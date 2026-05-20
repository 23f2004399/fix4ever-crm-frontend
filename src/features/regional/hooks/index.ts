import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as regionalApi from "../api";

export const regionalKeys = {
  dashboard: (params?: object) => ["regional", "dashboard", params] as const,
  technicians: (params?: object) =>
    ["regional", "technicians", params] as const,
  technician: (id: string) => ["regional", "technician", id] as const,
  technicianWorkload: (params?: object) =>
    ["regional", "workload", params] as const,
  technicianPerf: (id: string, params?: object) =>
    ["regional", "technician-perf", id, params] as const,
  sla: (params?: object) => ["regional", "sla", params] as const,
  serviceRequests: (params?: object) =>
    ["regional", "service-requests", params] as const,
  customerInsights: (params?: object) =>
    ["regional", "customer-insights", params] as const,
  loyaltyInsights: (params?: object) =>
    ["regional", "loyalty-insights", params] as const,
  analytics: (params?: object) => ["regional", "analytics", params] as const,
  resourcePlanning: (params?: object) =>
    ["regional", "resource-planning", params] as const,
  campaigns: (params?: object) => ["regional", "campaigns", params] as const,
  finance: (params?: object) => ["regional", "finance", params] as const,
  profitability: (params?: object) =>
    ["regional", "profitability", params] as const,
  auditLogs: (params?: object) => ["regional", "audit-logs", params] as const,
  growth: (params?: object) => ["regional", "growth", params] as const,
  benchmark: (params?: object) => ["regional", "benchmark", params] as const,
};

export function useDashboard(params?: { region?: string }) {
  return useQuery({
    queryKey: regionalKeys.dashboard(params),
    queryFn: () => regionalApi.fetchDashboard(params),
  });
}

export function useTechnicians(
  params?: Parameters<typeof regionalApi.fetchTechnicians>[0],
) {
  return useQuery({
    queryKey: regionalKeys.technicians(params),
    queryFn: () => regionalApi.fetchTechnicians(params),
  });
}

export function useTechnicianDetail(
  vendorId: string,
  params?: { region?: string },
) {
  return useQuery({
    queryKey: regionalKeys.technician(vendorId),
    queryFn: () => regionalApi.fetchTechnicianDetail(vendorId, params),
    enabled: !!vendorId,
  });
}

export function useTechnicianWorkload(params?: { region?: string }) {
  return useQuery({
    queryKey: regionalKeys.technicianWorkload(params),
    queryFn: () => regionalApi.fetchTechnicianWorkload(params),
  });
}

export function useTechnicianPerformance(
  vendorId: string,
  params?: { region?: string; from?: string; to?: string },
) {
  return useQuery({
    queryKey: regionalKeys.technicianPerf(vendorId, params),
    queryFn: () => regionalApi.fetchTechnicianPerformance(vendorId, params),
    enabled: !!vendorId,
  });
}

export function useSlaReport(params?: { region?: string }) {
  return useQuery({
    queryKey: regionalKeys.sla(params),
    queryFn: () => regionalApi.fetchSlaReport(params),
  });
}

export function useRegionalServiceRequests(
  params?: Parameters<typeof regionalApi.fetchServiceRequests>[0],
) {
  return useQuery({
    queryKey: regionalKeys.serviceRequests(params),
    queryFn: () => regionalApi.fetchServiceRequests(params),
  });
}

export function useAssignSR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { vendorId: string; region?: string };
    }) => regionalApi.assignServiceRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regional", "service-requests"] });
      toast.success("Service request assigned");
    },
    onError: () => toast.error("Failed to assign"),
  });
}

export function useReassignSR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { vendorId: string; reason: string; region?: string };
    }) => regionalApi.reassignServiceRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regional", "service-requests"] });
      toast.success("Service request reassigned");
    },
    onError: () => toast.error("Failed to reassign"),
  });
}

export function useCancelSR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { reason: string; region?: string };
    }) => regionalApi.cancelServiceRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regional", "service-requests"] });
      toast.success("Service request cancelled");
    },
    onError: () => toast.error("Failed to cancel"),
  });
}

export function useCustomerInsights(
  params?: Parameters<typeof regionalApi.fetchCustomerInsights>[0],
) {
  return useQuery({
    queryKey: regionalKeys.customerInsights(params),
    queryFn: () => regionalApi.fetchCustomerInsights(params),
  });
}

export function useLoyaltyInsights(params?: { region?: string }) {
  return useQuery({
    queryKey: regionalKeys.loyaltyInsights(params),
    queryFn: () => regionalApi.fetchLoyaltyInsights(params),
  });
}

export function useRegionalAnalytics(params?: {
  region?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: regionalKeys.analytics(params),
    queryFn: () => regionalApi.fetchAnalytics(params),
  });
}

export function useResourcePlanning(params?: { region?: string }) {
  return useQuery({
    queryKey: regionalKeys.resourcePlanning(params),
    queryFn: () => regionalApi.fetchResourcePlanning(params),
  });
}

export function useRegionalCampaigns(
  params?: Parameters<typeof regionalApi.fetchCampaigns>[0],
) {
  return useQuery({
    queryKey: regionalKeys.campaigns(params),
    queryFn: () => regionalApi.fetchCampaigns(params),
  });
}

export function useReviewCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { action: "approve" | "reject"; rejectionReason?: string };
    }) => regionalApi.reviewCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["regional", "campaigns"] });
      toast.success("Campaign reviewed");
    },
    onError: () => toast.error("Failed to review campaign"),
  });
}

export function useRegionalFinance(params?: {
  region?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: regionalKeys.finance(params),
    queryFn: () => regionalApi.fetchFinance(params),
  });
}

export function useProfitability(params?: {
  region?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: regionalKeys.profitability(params),
    queryFn: () => regionalApi.fetchProfitability(params),
  });
}

export function useGrowthOpportunities(params?: { region?: string }) {
  return useQuery({
    queryKey: regionalKeys.growth(params),
    queryFn: () => regionalApi.fetchGrowthOpportunities(params),
  });
}

export function useRegionalBenchmark(params?: {
  region?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: regionalKeys.benchmark(params),
    queryFn: () => regionalApi.fetchBenchmark(params),
  });
}
