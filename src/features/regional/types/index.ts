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

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface RegionalDashboard {
  region: string;
  period: { from: string; to: string };
  serviceRequests: {
    total: number;
    completed: number;
    active: number;
    cancelled: number;
    pending: number;
    completionRate: string;
  };
  revenue: { total: number; avgOrderValue: number };
  technicians: { total: number; approved: number };
  slaViolations: number;
  avgCustomerSatisfaction: number | string;
}

// ─── Technician ──────────────────────────────────────────────────────────────

export interface RegionalVendor {
  _id: string;
  pocInfo: { fullName: string; email: string; phone?: string };
  operationalDetails: {
    serviceAreas: string[];
    workingHours?: { start: string; end: string };
  };
  currentLocation?: { latitude: number; longitude: number };
  averageRating: number;
  totalReviews: number;
  Level: string | null;
  onboardingStatus: string;
}

export interface TechnicianDetail {
  vendor: RegionalVendor;
  activeJobs: number;
  completedJobs: number;
  recentReviews: Array<{
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    customerId?: { username: string } | null;
  }>;
}

export interface TechnicianWorkload {
  _id: string;
  activeJobs: number;
  vendorName: string;
  vendorLevel: string;
  averageRating: number;
  serviceAreas: string[];
}

export interface TechnicianPerformance {
  vendor: {
    pocInfo: { fullName: string };
    averageRating: number;
    Level: string | null;
  };
  dateRange: { from: string; to: string };
  performance: {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalRevenue: number;
    avgOrderValue: number;
    completionRate: string;
  };
  ratingTrend: Array<{
    _id: { year: number; month: number };
    avgRating: number;
    count: number;
  }>;
  statusBreakdown: Array<{ _id: string; count: number }>;
}

// ─── Service Request ─────────────────────────────────────────────────────────

export interface RegionalSR {
  _id: string;
  request_id: string;
  status: string;
  serviceType: string;
  brand: string;
  model: string;
  city: string;
  priority: string;
  adminFinalPrice: number;
  createdAt: string;
  customerId?: { username: string; email: string } | string;
  assignedVendor?: { pocInfo?: { fullName: string } } | string | null;
}

// ─── SLA ─────────────────────────────────────────────────────────────────────

export interface SlaReport {
  region: string;
  summary: { active: number; slaBreached: number; upcomingBreachCount: number };
  upcomingBreaches: Array<{
    _id: string;
    request_id: string;
    status: string;
    timerExpiresAt: string;
    priority?: string;
  }>;
  recentEscalations: Array<{ _id: string; request_id: string; status: string }>;
  slaComplianceRate: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface RegionalAnalytics {
  region: string;
  dateRange: { from: string; to: string };
  serviceStats: Array<{ _id: string; count: number }>;
  serviceByType: Array<{ _id: string; count: number; revenue: number }>;
  dailyTrend: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
    revenue: number;
  }>;
  topTechnicians: Array<{
    vendorName: string;
    completedJobs: number;
    revenue: number;
    vendorRating: number;
  }>;
  resolutionTime: {
    avgResolutionHours: number;
    minResolutionHours: number;
    maxResolutionHours: number;
  };
  totalRevenue: number;
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export interface RegionalFinance {
  region: string;
  dateRange: { from: string; to: string };
  totalRevenue: number;
  revenueByServiceType: Array<{
    _id: string;
    revenue: number;
    jobs: number;
    avgOrderValue: number;
  }>;
  topVendorsByRevenue: Array<{
    vendorName: string;
    revenue: number;
    jobs: number;
  }>;
  pendingPayments: number;
  refunds: { count: number; total: number };
  dailyRevenue: Array<{
    _id: { year: number; month: number; day: number };
    revenue: number;
    jobs: number;
  }>;
}

// ─── Resource Planning ───────────────────────────────────────────────────────

export interface ResourcePlanning {
  region: string;
  capacity: {
    totalVendors: number;
    approvedVendors: number;
    overloadedVendors: number;
  };
  activeJobs: number;
  utilizationRate: string;
  demandByDayOfWeek: Array<{ _id: number; avgDemand: number }>;
  recommendation: string;
}

// ─── Campaign ────────────────────────────────────────────────────────────────

export interface RegionalCampaign {
  _id: string;
  title: string;
  type: string;
  status: string;
  targetSegment: string;
  targetRegion?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  stats: { sent: number; delivered: number; opened: number; converted: number };
  createdAt: string;
  createdBy?: { username: string; email: string } | string;
}

// ─── Strategic ───────────────────────────────────────────────────────────────

export interface GrowthOpportunities {
  region: string;
  period: string;
  unservedRequests: number;
  topDemandAreas: Array<{ _id: string; demand: number }>;
  technicianGap: {
    approvedVendors: number;
    activeJobs: number;
    supplyDemandRatio: string;
    isUnderstaffed: boolean;
  };
  categoryOpportunities: Array<{
    _id: string;
    totalRequests: number;
    completed: number;
    incompletionRate: number;
  }>;
  insights: string[];
}

export interface RegionalBenchmark {
  region: string;
  dateRange: { from: string; to: string };
  regional: {
    totalSR: number;
    completionRate: string;
    cancellationRate: string;
    totalRevenue: number;
    avgOrderValue: number;
  };
  platform: {
    totalSR: number;
    completionRate: string;
    cancellationRate: string;
    totalRevenue: number;
    avgOrderValue: number;
  };
  comparison: {
    completionRateVsPlatform: string;
    revenuePlatformShare: string;
  };
}

// ─── Customer Insights ───────────────────────────────────────────────────────

export interface RegionalCustomer {
  _id: string;
  orderCount: number;
  completed: number;
  totalSpent: number;
  lastOrderDate: string;
  customer: {
    username: string;
    email: string;
    phone?: string;
    isActive: boolean;
  };
}

export interface LoyaltyInsights {
  region: string;
  totalUniqueCustomers: number;
  activeSubscribers: number;
  walletHolders: number;
  subscriptionAdoptionRate: string;
  walletAdoptionRate: string;
}
