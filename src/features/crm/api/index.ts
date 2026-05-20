/**
 * CRM Manager API
 * All calls go to /api/v1/crm/*
 */
import { api } from "@/shared/config/axios";
import type {
  ApiResponse,
  Customer,
  CustomerDetail,
  ServiceRequest,
  ServiceRequestDetail,
  Campaign,
  CreateCampaignPayload,
  Ticket,
  Review,
  ReviewStatus,
  TeamMember,
  CustomerAnalytics,
  RevenueAnalytics,
  WalletOverview,
  LoyaltyOverview,
  ReviewAnalytics,
  SegmentOverview,
  CampaignTemplate,
  CreateCampaignTemplatePayload,
  FollowUpRule,
  CreateFollowUpRulePayload,
} from "../types";

const BASE = "/crm";

// ─── §1 Customers ────────────────────────────────────────────────────────────

export const fetchCustomers = (params?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<Customer[]>>(`${BASE}/customers`, { params })
    .then((r) => r.data);

export const fetchCustomerSegment = (
  segment: string,
  params?: { page?: number; limit?: number },
) =>
  api
    .get<
      ApiResponse<Customer[]>
    >(`${BASE}/customers/segments/${segment}`, { params })
    .then((r) => r.data);

export const fetchCustomer = (customerId: string) =>
  api
    .get<ApiResponse<CustomerDetail>>(`${BASE}/customers/${customerId}`)
    .then((r) => r.data);

export const updateCustomer = (
  customerId: string,
  updates: { username?: string; phone?: string },
) =>
  api
    .patch<ApiResponse<Customer>>(`${BASE}/customers/${customerId}`, updates)
    .then((r) => r.data);

export const blockCustomer = (customerId: string, reason: string) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/customers/${customerId}/block`, { reason })
    .then((r) => r.data);

export const unblockCustomer = (customerId: string) =>
  api
    .patch<ApiResponse<unknown>>(`${BASE}/customers/${customerId}/unblock`)
    .then((r) => r.data);

export const fetchCustomerInteractions = (
  customerId: string,
  params?: { page?: number; limit?: number },
) =>
  api
    .get<
      ApiResponse<ServiceRequest[]>
    >(`${BASE}/customers/${customerId}/interactions`, { params })
    .then((r) => r.data);

export const fetchCustomerSubscription = (customerId: string) =>
  api
    .get<ApiResponse<unknown[]>>(`${BASE}/customers/${customerId}/subscription`)
    .then((r) => r.data);

export const manageSubscription = (
  customerId: string,
  action: "cancel" | "pause" | "reactivate",
  reason?: string,
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/customers/${customerId}/subscription`, { action, reason })
    .then((r) => r.data);

export const fetchCustomerWallet = (
  customerId: string,
  params?: { page?: number; limit?: number },
) =>
  api
    .get<
      ApiResponse<unknown[]>
    >(`${BASE}/customers/${customerId}/wallet`, { params })
    .then((r) => r.data);

export const fetchCustomerServiceHistory = (
  customerId: string,
  params?: {
    status?: string;
    serviceType?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
) =>
  api
    .get<
      ApiResponse<ServiceRequest[]>
    >(`${BASE}/customers/${customerId}/service-requests`, { params })
    .then((r) => r.data);

export const fetchCustomerPaymentHistory = (
  customerId: string,
  params?: { status?: string; page?: number; limit?: number },
) =>
  api
    .get<
      ApiResponse<unknown[]>
    >(`${BASE}/customers/${customerId}/payments`, { params })
    .then((r) => r.data);

// ─── §2 Service Requests ─────────────────────────────────────────────────────

export const fetchServiceRequests = (params?: {
  status?: string;
  city?: string;
  priority?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<ServiceRequest[]>>(`${BASE}/service-requests`, { params })
    .then((r) => r.data);

export interface SRTrends {
  statusBreakdown: { _id: string; count: number }[];
  dailyVolume: {
    _id: { year: number; month: number; day: number };
    count: number;
  }[];
  completionRateByServiceType: {
    _id: string;
    total: number;
    completed: number;
    cancelled: number;
    completionRate: number;
    avgPrice: number;
  }[];
  recurringIssues: {
    brand: string;
    problem: string;
    subProblem: string | null;
    count: number;
    cancelledCount: number;
    cancellationRate: number;
  }[];
  topProblems: {
    _id: string;
    count: number;
    completedCount: number;
    cancelledCount: number;
  }[];
  cancellationReasons: { _id: string; count: number }[];
  topBrands: { _id: string; count: number }[];
  topCities: { _id: string; count: number }[];
}

export const fetchSRTrends = (params?: { from?: string; to?: string }) =>
  api
    .get<ApiResponse<SRTrends>>(`${BASE}/service-requests/trends`, { params })
    .then((r) => r.data);

export const fetchServiceRequest = (requestId: string) =>
  api
    .get<
      ApiResponse<ServiceRequestDetail>
    >(`${BASE}/service-requests/${requestId}`)
    .then((r) => r.data);

export interface SRUpdatePayload {
  userName?: string;
  userPhone?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  requestType?: "self" | "other";
  address?: string;
  city?: string;
  location?: { address?: string; lat?: number; lng?: number };
  customerLocation?: { latitude?: number; longitude?: number };
  brand?: string;
  model?: string;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  serviceType?: "pickup-drop" | "visit-shop" | "onsite";
  status?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  isUrgent?: boolean;
  mainProblem?: { id: string; title: string };
  subProblem?: { id: string; title: string };
  relationalBehaviors?: unknown[];
  minPrice?: number;
  maxPrice?: number;
  level?: string;
  problemDescription?: string;
  preferredDate?: string;
  preferredTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledSlot?: string;
  adminFinalPrice?: number;
  adminPricingNotes?: string;
  adminComponentCharges?: number;
  adminComponentNotes?: string;
  assignedTechnician?: string;
  assignedVendor?: string;
  assignedCaptain?: string;
  technicianNotes?: string;
  scheduleNotes?: string;
}

export const updateServiceRequest = (
  requestId: string,
  updates: SRUpdatePayload,
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}`, updates)
    .then((r) => r.data);

export const escalateServiceRequest = (requestId: string, note: string) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}/escalate`, { note })
    .then((r) => r.data);

export const tagServiceRequest = (requestId: string, tag: string) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/service-requests/${requestId}/tag`, { tag })
    .then((r) => r.data);

export const fetchTechnicianPerformance = (params?: {
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<unknown[]>>(`${BASE}/technicians/performance`, { params })
    .then((r) => r.data);

// ─── §3 Notifications ────────────────────────────────────────────────────────

export const broadcastNotification = (payload: {
  title: string;
  message: string;
  type: string;
  targetRole?: string;
  targetUsers?: string[];
  targetSegment?: string;
}) =>
  api
    .post<
      ApiResponse<{ sent: number }>
    >(`${BASE}/notifications/broadcast`, payload)
    .then((r) => r.data);

export const fetchNotificationStats = () =>
  api
    .get<ApiResponse<unknown>>(`${BASE}/notifications/stats`)
    .then((r) => r.data);

// ─── §4 Analytics ────────────────────────────────────────────────────────────

export const fetchCustomerAnalytics = () =>
  api
    .get<ApiResponse<CustomerAnalytics>>(`${BASE}/analytics/customers`)
    .then((r) => r.data);

export const fetchRevenueAnalytics = (params?: {
  from?: string;
  to?: string;
}) =>
  api
    .get<ApiResponse<RevenueAnalytics>>(`${BASE}/analytics/revenue`, { params })
    .then((r) => r.data);

export const fetchSubscriptionAnalytics = () =>
  api
    .get<ApiResponse<unknown>>(`${BASE}/analytics/subscriptions`)
    .then((r) => r.data);

export const fetchConversionAnalytics = (params?: {
  from?: string;
  to?: string;
}) =>
  api
    .get<ApiResponse<unknown>>(`${BASE}/analytics/conversions`, { params })
    .then((r) => r.data);

export const fetchHighValueCustomers = (params?: { limit?: number }) =>
  api
    .get<
      ApiResponse<unknown[]>
    >(`${BASE}/analytics/high-value-customers`, { params })
    .then((r) => r.data);

export const fetchChurnAnalysis = (params?: {
  inactiveDays?: number;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<Customer[]>>(`${BASE}/analytics/churn`, { params })
    .then((r) => r.data);

// ─── §5 Tickets ──────────────────────────────────────────────────────────────

export const fetchTickets = (params?: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<Ticket[]>>(`${BASE}/tickets`, { params })
    .then((r) => r.data);

export const createTicket = (payload: {
  title: string;
  description: string;
  category: string;
  priority: string;
  relatedServiceRequest?: string;
}) =>
  api.post<ApiResponse<Ticket>>(`${BASE}/tickets`, payload).then((r) => r.data);

export const assignTicket = (ticketId: string, assignedTo: string) =>
  api
    .patch<
      ApiResponse<Ticket>
    >(`${BASE}/tickets/${ticketId}/assign`, { assignedTo })
    .then((r) => r.data);

export const resolveTicket = (ticketId: string, resolutionNote: string) =>
  api
    .patch<
      ApiResponse<Ticket>
    >(`${BASE}/tickets/${ticketId}/resolve`, { resolutionNote })
    .then((r) => r.data);

export const escalateTicket = (
  ticketId: string,
  escalatedTo: string,
  note: string,
) =>
  api
    .patch<
      ApiResponse<Ticket>
    >(`${BASE}/tickets/${ticketId}/escalate`, { escalatedTo, note })
    .then((r) => r.data);

export const compensateTicket = (
  ticketId: string,
  payload: { customerId: string; amount: number; reason: string },
) =>
  api
    .patch<
      ApiResponse<unknown>
    >(`${BASE}/tickets/${ticketId}/compensate`, payload)
    .then((r) => r.data);

// ─── §6 Wallet/Payments ──────────────────────────────────────────────────────

export const fetchWalletOverview = () =>
  api
    .get<ApiResponse<WalletOverview>>(`${BASE}/analytics/wallet`)
    .then((r) => r.data);

export const fetchFailedPayments = (params?: {
  page?: number;
  limit?: number;
}) =>
  api
    .get<
      ApiResponse<unknown[]>
    >(`${BASE}/analytics/payments/failed`, { params })
    .then((r) => r.data);

// ─── §7 Campaigns ────────────────────────────────────────────────────────────

export const fetchCampaigns = (params?: {
  status?: string;
  type?: string;
  segment?: string;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<Campaign[]>>(`${BASE}/campaigns`, { params })
    .then((r) => r.data);

export const fetchCampaign = (campaignId: string) =>
  api
    .get<ApiResponse<Campaign>>(`${BASE}/campaigns/${campaignId}`)
    .then((r) => r.data);

export const createCampaign = (payload: CreateCampaignPayload) =>
  api
    .post<ApiResponse<Campaign>>(`${BASE}/campaigns`, payload)
    .then((r) => r.data);

export const updateCampaign = (
  campaignId: string,
  updates: Partial<CreateCampaignPayload> & { status?: string },
) =>
  api
    .patch<ApiResponse<Campaign>>(`${BASE}/campaigns/${campaignId}`, updates)
    .then((r) => r.data);

export const activateCampaign = (campaignId: string) =>
  api
    .patch<ApiResponse<Campaign>>(`${BASE}/campaigns/${campaignId}/activate`)
    .then((r) => r.data);

export const deleteCampaign = (campaignId: string) =>
  api
    .delete<ApiResponse<null>>(`${BASE}/campaigns/${campaignId}`)
    .then((r) => r.data);

export const restartCampaign = (campaignId: string) =>
  api
    .patch<ApiResponse<Campaign>>(`${BASE}/campaigns/${campaignId}/restart`)
    .then((r) => r.data);

// ─── §8 Campaign Templates ────────────────────────────────────────────────────

export const fetchCampaignTemplates = (channel?: string) =>
  api
    .get<ApiResponse<CampaignTemplate[]>>(`${BASE}/campaign-templates`, {
      params: channel ? { channel } : undefined,
    })
    .then((r) => r.data);

export const createCampaignTemplate = (
  payload: CreateCampaignTemplatePayload,
) =>
  api
    .post<ApiResponse<CampaignTemplate>>(`${BASE}/campaign-templates`, payload)
    .then((r) => r.data);

export const updateCampaignTemplate = (
  templateId: string,
  updates: Partial<CreateCampaignTemplatePayload> & { isActive?: boolean },
) =>
  api
    .patch<
      ApiResponse<CampaignTemplate>
    >(`${BASE}/campaign-templates/${templateId}`, updates)
    .then((r) => r.data);

export const deleteCampaignTemplate = (templateId: string) =>
  api
    .delete<ApiResponse<null>>(`${BASE}/campaign-templates/${templateId}`)
    .then((r) => r.data);

// ─── §9 Follow-Up Rules ──────────────────────────────────────────────────────

export const fetchFollowUpRules = () =>
  api
    .get<ApiResponse<FollowUpRule[]>>(`${BASE}/follow-up-rules`)
    .then((r) => r.data);

export const createFollowUpRule = (payload: CreateFollowUpRulePayload) =>
  api
    .post<ApiResponse<FollowUpRule>>(`${BASE}/follow-up-rules`, payload)
    .then((r) => r.data);

export const updateFollowUpRule = (
  ruleId: string,
  updates: Partial<CreateFollowUpRulePayload> & { isActive?: boolean },
) =>
  api
    .patch<
      ApiResponse<FollowUpRule>
    >(`${BASE}/follow-up-rules/${ruleId}`, updates)
    .then((r) => r.data);

export const deleteFollowUpRule = (ruleId: string) =>
  api
    .delete<ApiResponse<null>>(`${BASE}/follow-up-rules/${ruleId}`)
    .then((r) => r.data);

export const toggleFollowUpRule = (ruleId: string) =>
  api
    .patch<
      ApiResponse<FollowUpRule>
    >(`${BASE}/follow-up-rules/${ruleId}/toggle`)
    .then((r) => r.data);

export const runFollowUpRule = (ruleId: string) =>
  api
    .post<
      ApiResponse<{
        rule: FollowUpRule;
        result: { sent: number; failed: number };
      }>
    >(`${BASE}/follow-up-rules/${ruleId}/run`)
    .then((r) => r.data);

// ─── §10 Reviews ─────────────────────────────────────────────────────────────

export const fetchReviews = (params?: {
  minRating?: number;
  maxRating?: number;
  reviewStatus?: string;
  hasResponse?: boolean;
  page?: number;
  limit?: number;
}) =>
  api
    .get<ApiResponse<Review[]>>(`${BASE}/reviews`, { params })
    .then((r) => r.data);

export const fetchReviewAnalytics = () =>
  api
    .get<ApiResponse<ReviewAnalytics>>(`${BASE}/reviews/analytics`)
    .then((r) => r.data);

export const respondToReview = (reviewId: string, text: string) =>
  api
    .post<ApiResponse<Review>>(`${BASE}/reviews/${reviewId}/respond`, { text })
    .then((r) => r.data);

export const assignReview = (reviewId: string, assignedTo: string) =>
  api
    .post<ApiResponse<Review>>(`${BASE}/reviews/${reviewId}/assign`, {
      assignedTo,
    })
    .then((r) => r.data);

export const updateReviewStatus = (reviewId: string, status: ReviewStatus) =>
  api
    .patch<ApiResponse<Review>>(`${BASE}/reviews/${reviewId}/status`, {
      status,
    })
    .then((r) => r.data);

export const fetchTeamMembers = () =>
  api
    .get<ApiResponse<TeamMember[]>>(`${BASE}/team-members`)
    .then((r) => r.data);

// ─── §9 Loyalty ──────────────────────────────────────────────────────────────

export const fetchLoyaltyOverview = () =>
  api.get<ApiResponse<LoyaltyOverview>>(`${BASE}/loyalty`).then((r) => r.data);

// ─── §10 Segments ─────────────────────────────────────────────────────────────

export const fetchSegmentOverview = () =>
  api
    .get<ApiResponse<SegmentOverview>>(`${BASE}/analytics/segment-overview`)
    .then((r) => r.data);
