export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail {
  customer: Customer;
  wallet: {
    balance: number;
    totalCredited: number;
    totalDebited: number;
    isActive: boolean;
  } | null;
  activeSubscription: {
    _id: string;
    status: string;
    planId: { name: string; price: number; interval: string } | null;
  } | null;
  recentServiceRequests: ServiceRequest[];
  reviewCount: number;
}

export type CustomerSegment =
  // Demographics
  | "new_this_month"
  // Service usage
  | "returning"
  | "high_usage"
  | "recent_active"
  // Subscription plans
  | "active_subscribers"
  | "trial"
  | "expired_subscription"
  | "cancelled_subscription"
  | "no_subscription"
  // Loyalty levels
  | "high_value"
  | "at_risk"
  | "wallet_active"
  | "inactive";

export interface SegmentOverview {
  total: number;
  // Demographics
  newThisMonth: number;
  // Service usage
  returning: number;
  highUsage: number;
  recentActive: number;
  // Subscription plans
  activeSubscribers: number;
  trial: number;
  expiredSubscription: number;
  cancelledSubscription: number;
  noSubscription: number;
  // Loyalty levels
  highValue: number;
  atRisk: number;
  walletActive: number;
  inactive: number;
}

// ─── Service Request ─────────────────────────────────────────────────────────

export interface ServiceRequest {
  _id: string;
  request_id: string;
  status: string;
  serviceType: "pickup-drop" | "visit-shop" | "onsite";
  brand: string;
  model: string;
  deviceBrand?: string;
  deviceModel?: string;
  city: string;
  priority: "low" | "medium" | "high" | "urgent";
  adminFinalPrice?: number;
  paymentBreakdown?: { totalCost?: number };
  createdAt: string;
  userName?: string;
  userPhone?: string;
  customerId?:
    | { _id: string; username: string; email: string; phone?: string }
    | string;
  assignedVendor?:
    | { _id: string; pocInfo?: { fullName: string; email: string } }
    | string;
}

/** Full service request schema matching backend document */
export interface ServiceRequestDetail extends ServiceRequest {
  requestType?: string;
  address?: string;
  customerLocation?: { latitude: number; longitude: number };
  problemDescription?: string;
  issueImages?: string[];
  title?: string;
  description?: string;
  category?: string;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  knowsProblem?: boolean;
  budget?: number;
  isUrgent?: boolean;
  preferredDate?: string;
  preferredTime?: string;
  selectedComponents?: unknown[];
  componentCost?: number;
  requiresCustomerApproval?: boolean;
  customerApproved?: boolean;
  location?: { address: string; lat: number; lng: number };
  timerStartedAt?: string;
  timerExpiresAt?: string;
  isTimerActive?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledSlot?: string;
  scheduleStatus?: string;
  userResponse?: {
    status: string;
    respondedAt?: string;
    userNotes?: string;
  };
  repairDetails?: {
    problemIdentified?: boolean;
    repairStarted?: boolean;
    repairCompleted?: boolean;
    partsUsed?: unknown[];
  };
  vendorPriceBreakdown?: {
    baseServiceCharge?: number;
    partsCost?: number;
    travelCost?: number;
    emergencyFee?: number;
    totalAmount?: number;
  };
  calculatedPricing?: {
    serviceChargeRange?: { min: number; max: number };
    netChargeRange?: { min: number; max: number };
    finalChargeRange?: { min: number; max: number };
    breakdown?: string[];
    serviceType?: string;
    warrantyOption?: string;
    urgencyLevel?: string;
  };
  paymentBreakdown?: {
    serviceCost?: number;
    componentCost?: number;
    pickupCost?: number;
    deliveryCost?: number;
    emergencyCharges?: number;
    warrantyCharges?: number;
    dataSafetyCharges?: number;
    totalCost?: number;
    technicianCharges?: number;
    technicianEarnings?: number;
    companyCommission?: number;
  };
  paymentStatus?: string;
  mainProblem?: { id: string; title: string };
  subProblem?: { id: string; title: string };
  relationalBehaviors?: Array<{
    id: string;
    title: string;
    repair?: boolean;
    replacement?: boolean;
    pricing?: { min_price: number; max_price: number; currency: string };
  }>;
  minPrice?: number;
  maxPrice?: number;
  level?: string;
  couponDiscount?: number;
  couponCode?: string;
  statusHistory?: Array<{
    status: string;
    timestamp?: string;
    notes?: string;
    updatedBy?: string;
  }>;
  acceptedAt?: string;
  acceptedBy?: string;
  assignedTechnician?: string;
  assignedVendor?:
    | string
    | { _id: string; pocInfo?: { fullName: string; email: string } };
  vendorServiceCharge?: number;
  adminComponentNotes?: string;
  adminComponentCharges?: number;
  adminPricingNotes?: string;
  adminPricingSetAt?: string;
  adminPricingSetBy?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  assignedCaptain?: string;
  technicianNotes?: string;
  scheduleNotes?: string;
  tags?: string[];
}

// ─── Campaign ────────────────────────────────────────────────────────────────

export type CampaignType = "email" | "sms" | "in_app" | "push";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";
export type CampaignSegment =
  | "all"
  | "active_subscribers"
  | "inactive"
  | "new_this_month"
  | "high_value"
  | "regional"
  | "custom"
  | "repeat_customers"
  | "new_customers"
  | "device_laptop"
  | "device_mobile"
  | "high_spenders"
  | "onsite_users"
  | "pickup_drop_users";

export interface Campaign {
  _id: string;
  title: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  targetSegment: CampaignSegment;
  targetRegion?: string;
  targetCities?: string[];
  content: { subject?: string; body: string; callToAction?: string };
  scheduledAt?: string;
  sentAt?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    failed: number;
  };
  approvalStatus: "pending" | "approved" | "rejected";
  createdBy: { username: string; email: string } | string;
  createdAt: string;
}

export interface CreateCampaignPayload {
  title: string;
  description?: string;
  type: CampaignType;
  targetSegment: CampaignSegment;
  targetRegion?: string;
  targetCities?: string[];
  content: { subject?: string; body: string; callToAction?: string };
  scheduledAt?: string;
}

export interface CampaignTemplate {
  _id: string;
  name: string;
  description?: string;
  channel: CampaignType;
  subject?: string;
  body: string;
  callToAction?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignTemplatePayload {
  name: string;
  description?: string;
  channel: CampaignType;
  subject?: string;
  body: string;
  callToAction?: string;
}

// ─── Follow-Up Rules ─────────────────────────────────────────────────────────

export type FollowUpTrigger =
  | "service_completed"
  | "subscription_expiry"
  | "subscription_renewed";

export type FollowUpChannel = "email" | "sms" | "in_app" | "push";

export interface FollowUpRule {
  _id: string;
  name: string;
  description?: string;
  trigger: FollowUpTrigger;
  isActive: boolean;
  delayHours: number;
  daysBeforeExpiry?: number;
  channel: FollowUpChannel;
  targetCities?: string[];
  content: { subject?: string; body: string; callToAction?: string };
  stats: {
    totalSent: number;
    totalFailed: number;
    lastRunAt?: string;
    lastRunSent?: number;
    lastRunFailed?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFollowUpRulePayload {
  name: string;
  description?: string;
  trigger: FollowUpTrigger;
  delayHours: number;
  daysBeforeExpiry?: number;
  channel: FollowUpChannel;
  targetCities?: string[];
  content: { subject?: string; body: string; callToAction?: string };
}

// ─── Ticket ──────────────────────────────────────────────────────────────────

export type TicketCategory =
  | "payment_issue"
  | "service_quality"
  | "technician_complaint"
  | "app_issue"
  | "refund_request"
  | "account_issue"
  | "other";

export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  raisedBy: string;
  assignedTo?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export type ReviewStatus =
  | "pending"
  | "assigned"
  | "responded"
  | "resolved"
  | "flagged";

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  serviceQuality: number;
  communication: number;
  punctuality: number;
  wouldRecommend: boolean;
  createdAt: string;
  customerId: { _id: string; username: string; email: string } | null;
  vendorId: { _id: string; pocInfo?: { fullName: string } } | null;
  serviceRequestId: {
    _id: string;
    request_id: string;
    brand: string;
    model: string;
  } | null;
  // CRM workflow fields
  reviewStatus?: ReviewStatus;
  flagged?: boolean;
  crmResponse?: {
    text: string;
    respondedBy: string | { username: string; email: string };
    respondedAt: string;
  };
  assignedTo?: { _id: string; username: string; email: string } | null;
}

export interface TeamMember {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  role: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  activeSubscribers: number;
  subscriptionRate: string;
  monthlyNewCustomers: number;
  lastMonthNewCustomers: number;
  growthRate: string;
  avgCustomerSatisfaction: number | string;
  totalReviews: number;
}

export interface RevenueAnalytics {
  dateRange: { from: string; to: string };
  totalRevenue: number;
  revenueTrend: {
    _id: { year: number; month: number; day: number };
    revenue: number;
    jobs: number;
  }[];
  revenueByServiceType: { _id: string; revenue: number; count: number }[];
  topCitiesByRevenue: { _id: string; revenue: number; count: number }[];
  refundStats: { totalRefunds: number; totalRefundAmount: number };
}

export interface WalletOverview {
  summary: {
    totalBalance: number;
    totalCredited: number;
    totalDebited: number;
    customers: number;
    avgBalance: number;
  };
  topWalletHolders: Array<{
    balance: number;
    userId?: { username: string; email: string };
  }>;
}

export interface LoyaltyOverview {
  activeSubscribers: number;
  subscriptionsByPlan: Array<{ planName: string; count: number }>;
  wallet: { totalWallets: number; activeWallets: number; totalBalance: number };
  repeatCustomers: number;
  avgOrdersPerCustomer: string | number;
}

export interface ReviewAnalytics {
  overall: {
    avgRating: number;
    total: number;
    avgServiceQuality: number;
    avgCommunication: number;
    avgPunctuality: number;
  };
  ratingDistribution: Array<{ _id: number; count: number }>;
  monthlyTrend: Array<{
    _id: { year: number; month: number };
    avgRating: number;
    count: number;
  }>;
}
