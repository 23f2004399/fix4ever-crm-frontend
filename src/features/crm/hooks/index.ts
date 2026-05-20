import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as crmApi from "../api";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const crmKeys = {
  customers: (params?: object) => ["crm", "customers", params] as const,
  customer: (id: string) => ["crm", "customer", id] as const,
  customerSegment: (segment: string, params?: object) =>
    ["crm", "segments", segment, params] as const,
  customerInteractions: (id: string) =>
    ["crm", "customer", id, "interactions"] as const,
  customerSubscription: (id: string) =>
    ["crm", "customer", id, "subscription"] as const,
  customerWallet: (id: string) => ["crm", "customer", id, "wallet"] as const,
  customerServiceHistory: (id: string, params?: object) =>
    ["crm", "customer", id, "service-history", params] as const,
  customerPayments: (id: string, params?: object) =>
    ["crm", "customer", id, "payments", params] as const,
  serviceRequests: (params?: object) =>
    ["crm", "service-requests", params] as const,
  serviceRequest: (id: string) => ["crm", "service-request", id] as const,
  srTrends: (params?: object) => ["crm", "sr-trends", params] as const,
  technicianPerformance: (params?: object) =>
    ["crm", "technician-perf", params] as const,
  notificationStats: () => ["crm", "notification-stats"] as const,
  customerAnalytics: () => ["crm", "analytics", "customers"] as const,
  revenueAnalytics: (params?: object) =>
    ["crm", "analytics", "revenue", params] as const,
  subscriptionAnalytics: () => ["crm", "analytics", "subscriptions"] as const,
  conversionAnalytics: (params?: object) =>
    ["crm", "analytics", "conversions", params] as const,
  highValueCustomers: (limit?: number) => ["crm", "high-value", limit] as const,
  churnAnalysis: (params?: object) => ["crm", "churn", params] as const,
  walletOverview: () => ["crm", "wallet-overview"] as const,
  failedPayments: (params?: object) =>
    ["crm", "failed-payments", params] as const,
  campaigns: (params?: object) => ["crm", "campaigns", params] as const,
  campaign: (id: string) => ["crm", "campaign", id] as const,
  tickets: (params?: object) => ["crm", "tickets", params] as const,
  reviews: (params?: object) => ["crm", "reviews", params] as const,
  reviewAnalytics: () => ["crm", "review-analytics"] as const,
  loyalty: () => ["crm", "loyalty"] as const,
  segmentOverview: () => ["crm", "segment-overview"] as const,
};

// ─── Customer Hooks ───────────────────────────────────────────────────────────

export function useCustomers(
  params?: Parameters<typeof crmApi.fetchCustomers>[0],
) {
  return useQuery({
    queryKey: crmKeys.customers(params),
    queryFn: () => crmApi.fetchCustomers(params),
  });
}

export function useCustomersInfinite(params?: {
  search?: string;
  isActive?: boolean;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: crmKeys.customers(params),
    queryFn: ({ pageParam = 1 }) =>
      crmApi.fetchCustomers({ ...params, page: pageParam as number }),
    getNextPageParam: (last) =>
      last.pagination?.hasNext ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: crmKeys.customer(customerId),
    queryFn: () => crmApi.fetchCustomer(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerSegment(
  segment: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: crmKeys.customerSegment(segment, params),
    queryFn: () => crmApi.fetchCustomerSegment(segment, params),
    enabled: !!segment,
  });
}

export function useCustomerInteractions(
  customerId: string,
  params?: { page?: number },
) {
  return useQuery({
    queryKey: crmKeys.customerInteractions(customerId),
    queryFn: () => crmApi.fetchCustomerInteractions(customerId, params),
    enabled: !!customerId,
  });
}

export function useCustomerSubscription(customerId: string) {
  return useQuery({
    queryKey: crmKeys.customerSubscription(customerId),
    queryFn: () => crmApi.fetchCustomerSubscription(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerWallet(
  customerId: string,
  params?: { page?: number },
) {
  return useQuery({
    queryKey: crmKeys.customerWallet(customerId),
    queryFn: () => crmApi.fetchCustomerWallet(customerId, params),
    enabled: !!customerId,
  });
}

export function useCustomerServiceHistory(
  customerId: string,
  params?: {
    status?: string;
    serviceType?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: crmKeys.customerServiceHistory(customerId, params),
    queryFn: () => crmApi.fetchCustomerServiceHistory(customerId, params),
    enabled: !!customerId,
  });
}

export function useCustomerPaymentHistory(
  customerId: string,
  params?: { status?: string; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: crmKeys.customerPayments(customerId, params),
    queryFn: () => crmApi.fetchCustomerPaymentHistory(customerId, params),
    enabled: !!customerId,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { username?: string; phone?: string };
    }) => crmApi.updateCustomer(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.customer(id) });
      qc.invalidateQueries({ queryKey: ["crm", "customers"] });
      toast.success("Customer updated");
    },
    onError: () => toast.error("Failed to update customer"),
  });
}

export function useBlockCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      crmApi.blockCustomer(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.customer(id) });
      qc.invalidateQueries({ queryKey: ["crm", "customers"] });
      toast.success("Customer blocked");
    },
    onError: () => toast.error("Failed to block customer"),
  });
}

export function useUnblockCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.unblockCustomer(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: crmKeys.customer(id) });
      qc.invalidateQueries({ queryKey: ["crm", "customers"] });
      toast.success("Customer unblocked");
    },
    onError: () => toast.error("Failed to unblock customer"),
  });
}

export function useManageSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      action,
      reason,
    }: {
      customerId: string;
      action: "cancel" | "pause" | "reactivate";
      reason?: string;
    }) => crmApi.manageSubscription(customerId, action, reason),
    onSuccess: (_, { customerId }) => {
      qc.invalidateQueries({
        queryKey: crmKeys.customerSubscription(customerId),
      });
      qc.invalidateQueries({ queryKey: crmKeys.customer(customerId) });
      toast.success("Subscription updated");
    },
    onError: () => toast.error("Failed to update subscription"),
  });
}

// ─── Service Request Hooks ────────────────────────────────────────────────────

export function useServiceRequests(
  params?: Parameters<typeof crmApi.fetchServiceRequests>[0],
) {
  return useQuery({
    queryKey: crmKeys.serviceRequests(params),
    queryFn: () => crmApi.fetchServiceRequests(params),
  });
}

export function useServiceRequest(requestId: string) {
  return useQuery({
    queryKey: crmKeys.serviceRequest(requestId),
    queryFn: () => crmApi.fetchServiceRequest(requestId),
    enabled: !!requestId,
  });
}

export function useSRTrends(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: crmKeys.srTrends(params),
    queryFn: () => crmApi.fetchSRTrends(params),
  });
}

export function useUpdateServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof crmApi.updateServiceRequest>[1];
    }) => crmApi.updateServiceRequest(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.serviceRequest(id) });
      qc.invalidateQueries({ queryKey: ["crm", "service-requests"] });
      toast.success("Service request updated");
    },
    onError: () => toast.error("Failed to update service request"),
  });
}

export function useEscalateSR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      crmApi.escalateServiceRequest(id, note),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.serviceRequest(id) });
      qc.invalidateQueries({ queryKey: ["crm", "service-requests"] });
      toast.success("Service request escalated");
    },
    onError: () => toast.error("Failed to escalate"),
  });
}

export function useTagSR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: string }) =>
      crmApi.tagServiceRequest(id, tag),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.serviceRequest(id) });
      toast.success("Tagged successfully");
    },
    onError: () => toast.error("Failed to tag"),
  });
}

export function useTechnicianPerformance(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: crmKeys.technicianPerformance(params),
    queryFn: () => crmApi.fetchTechnicianPerformance(params),
  });
}

// ─── Analytics Hooks ─────────────────────────────────────────────────────────

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: crmKeys.customerAnalytics(),
    queryFn: crmApi.fetchCustomerAnalytics,
  });
}

export function useRevenueAnalytics(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: crmKeys.revenueAnalytics(params),
    queryFn: () => crmApi.fetchRevenueAnalytics(params),
  });
}

export function useSubscriptionAnalytics() {
  return useQuery({
    queryKey: crmKeys.subscriptionAnalytics(),
    queryFn: crmApi.fetchSubscriptionAnalytics,
  });
}

export function useConversionAnalytics(params?: {
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: crmKeys.conversionAnalytics(params),
    queryFn: () => crmApi.fetchConversionAnalytics(params),
  });
}

export function useHighValueCustomers(limit?: number) {
  return useQuery({
    queryKey: crmKeys.highValueCustomers(limit),
    queryFn: () => crmApi.fetchHighValueCustomers({ limit }),
  });
}

export function useChurnAnalysis(params?: {
  inactiveDays?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: crmKeys.churnAnalysis(params),
    queryFn: () => crmApi.fetchChurnAnalysis(params),
  });
}

export function useWalletOverview() {
  return useQuery({
    queryKey: crmKeys.walletOverview(),
    queryFn: crmApi.fetchWalletOverview,
  });
}

export function useFailedPayments(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: crmKeys.failedPayments(params),
    queryFn: () => crmApi.fetchFailedPayments(params),
  });
}

// ─── Campaign Hooks ───────────────────────────────────────────────────────────

export function useCampaigns(
  params?: Parameters<typeof crmApi.fetchCampaigns>[0],
) {
  return useQuery({
    queryKey: crmKeys.campaigns(params),
    queryFn: () => crmApi.fetchCampaigns(params),
  });
}

export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: crmKeys.campaign(campaignId),
    queryFn: () => crmApi.fetchCampaign(campaignId),
    enabled: !!campaignId,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      toast.success("Campaign created");
    },
    onError: () => toast.error("Failed to create campaign"),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof crmApi.updateCampaign>[1];
    }) => crmApi.updateCampaign(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.campaign(id) });
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      toast.success("Campaign updated");
    },
    onError: () => toast.error("Failed to update campaign"),
  });
}

export function useActivateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.activateCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      toast.success("Campaign activated");
    },
    onError: () => toast.error("Failed to activate campaign"),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.deleteCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      toast.success("Campaign deleted");
    },
    onError: () => toast.error("Failed to delete campaign"),
  });
}

export function useRestartCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.restartCampaign,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaigns"] });
      toast.success("Campaign reset to draft");
    },
    onError: () => toast.error("Failed to restart campaign"),
  });
}

// ─── Campaign Template Hooks ───────────────────────────────────────────────────

export function useCampaignTemplates(channel?: string) {
  return useQuery({
    queryKey: ["crm", "campaign-templates", channel],
    queryFn: () => crmApi.fetchCampaignTemplates(channel),
  });
}

export function useCreateCampaignTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createCampaignTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaign-templates"] });
      toast.success("Template created");
    },
    onError: () => toast.error("Failed to create template"),
  });
}

export function useUpdateCampaignTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof crmApi.updateCampaignTemplate>[1];
    }) => crmApi.updateCampaignTemplate(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaign-templates"] });
      toast.success("Template updated");
    },
    onError: () => toast.error("Failed to update template"),
  });
}

export function useDeleteCampaignTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.deleteCampaignTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "campaign-templates"] });
      toast.success("Template deleted");
    },
    onError: () => toast.error("Failed to delete template"),
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: crmApi.broadcastNotification,
    onSuccess: (data: { data?: { sent?: number } }) =>
      toast.success(`Notification sent to ${data?.data?.sent ?? 0} users`),
    onError: () => toast.error("Failed to send notification"),
  });
}

// ─── Follow-Up Rule Hooks ────────────────────────────────────────────────────

export function useFollowUpRules() {
  return useQuery({
    queryKey: ["crm", "follow-up-rules"],
    queryFn: crmApi.fetchFollowUpRules,
  });
}

export function useCreateFollowUpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createFollowUpRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "follow-up-rules"] });
      toast.success("Follow-up rule created");
    },
    onError: () => toast.error("Failed to create rule"),
  });
}

export function useUpdateFollowUpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof crmApi.updateFollowUpRule>[1];
    }) => crmApi.updateFollowUpRule(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "follow-up-rules"] });
      toast.success("Rule updated");
    },
    onError: () => toast.error("Failed to update rule"),
  });
}

export function useDeleteFollowUpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.deleteFollowUpRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "follow-up-rules"] });
      toast.success("Rule deleted");
    },
    onError: () => toast.error("Failed to delete rule"),
  });
}

export function useToggleFollowUpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.toggleFollowUpRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "follow-up-rules"] });
    },
    onError: () => toast.error("Failed to toggle rule"),
  });
}

export function useRunFollowUpRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.runFollowUpRule,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["crm", "follow-up-rules"] });
      const r = (
        data as { data?: { result?: { sent?: number; failed?: number } } }
      )?.data?.result;
      toast.success(
        `Run complete — sent: ${r?.sent ?? 0}, failed: ${r?.failed ?? 0}`,
      );
    },
    onError: () => toast.error("Failed to run rule"),
  });
}

// ─── Ticket Hooks ─────────────────────────────────────────────────────────────

export function useTickets(params?: Parameters<typeof crmApi.fetchTickets>[0]) {
  return useQuery({
    queryKey: crmKeys.tickets(params),
    queryFn: () => crmApi.fetchTickets(params),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "tickets"] });
      toast.success("Ticket created");
    },
    onError: () => toast.error("Failed to create ticket"),
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      crmApi.resolveTicket(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "tickets"] });
      toast.success("Ticket resolved");
    },
    onError: () => toast.error("Failed to resolve ticket"),
  });
}

export function useCompensateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { customerId: string; amount: number; reason: string };
    }) => crmApi.compensateTicket(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm", "tickets"] });
      toast.success("Compensation credited to wallet");
    },
    onError: () => toast.error("Failed to issue compensation"),
  });
}

// ─── Review Hooks ─────────────────────────────────────────────────────────────

export function useReviews(params?: Parameters<typeof crmApi.fetchReviews>[0]) {
  return useQuery({
    queryKey: crmKeys.reviews(params),
    queryFn: () => crmApi.fetchReviews(params),
  });
}

export function useReviewAnalytics() {
  return useQuery({
    queryKey: crmKeys.reviewAnalytics(),
    queryFn: crmApi.fetchReviewAnalytics,
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["crm", "team-members"] as const,
    queryFn: crmApi.fetchTeamMembers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRespondToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, text }: { reviewId: string; text: string }) =>
      crmApi.respondToReview(reviewId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "reviews"] }),
  });
}

export function useAssignReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      assignedTo,
    }: {
      reviewId: string;
      assignedTo: string;
    }) => crmApi.assignReview(reviewId, assignedTo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "reviews"] }),
  });
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: Parameters<typeof crmApi.updateReviewStatus>[1];
    }) => crmApi.updateReviewStatus(reviewId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "reviews"] }),
  });
}

// ─── Loyalty Hook ─────────────────────────────────────────────────────────────

export function useLoyaltyOverview() {
  return useQuery({
    queryKey: crmKeys.loyalty(),
    queryFn: crmApi.fetchLoyaltyOverview,
  });
}

// ─── Segment Overview Hook ────────────────────────────────────────────────────

export function useSegmentOverview() {
  return useQuery({
    queryKey: crmKeys.segmentOverview(),
    queryFn: crmApi.fetchSegmentOverview,
    staleTime: 60_000,
  });
}
