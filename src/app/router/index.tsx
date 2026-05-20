import { createBrowserRouter, Navigate, Link } from "react-router-dom";

// Auth
import { LoginPage } from "@/features/auth/pages/LoginPage";
// Admin
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { AcceptInvitePage } from "@/features/admin/pages/AcceptInvitePage";
// CRM
import {
  CrmDashboard,
  CustomersPage,
  CustomerSegmentPage,
  CustomerDetailPage,
  ServiceRequestsPage,
  CampaignsPage,
  TicketsPage,
  AnalyticsPage,
  ReviewsPage,
  LoyaltyPage,
  TrendsPage,
  TemplatesPage,
  FollowUpsPage,
  SupportInboxPage,
} from "@/features/crm/pages";
// Captains
import {
  CaptainsPage,
  CaptainDetailPage,
  CaptainSettlementsPage,
} from "@/features/captains";
// Regional
import {
  RegionalDashboard,
  TechniciansPage,
  RegionalServiceRequestsPage,
  SlaPage,
  RegionalAnalyticsPage,
  FinancePage,
  RegionalCampaignsPage,
  StrategicPage,
  RegionalCustomersPage,
} from "@/features/regional/pages";
// Layout & Guards
import { AppLayout } from "@/shared/components/Layout";
import { ProtectedRoute, AdminRoute, CrmRoute, RegionalRoute } from "@/guards";
import { useAuthStore } from "@/features/auth/store/authStore";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Access Denied
        </h1>
        <p className="text-slate-500 mt-2 leading-relaxed">
          You don't have permission to access this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  const roles = user?.roles ?? [];

  if (user?.role === "admin" || user?.role === "super_admin") {
    return <Navigate to="/admin" replace />;
  }
  if (roles.includes("crm_manager")) {
    return <Navigate to="/crm" replace />;
  }
  if (roles.includes("regional_manager")) {
    return <Navigate to="/regional" replace />;
  }
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-white">
          Welcome to Fix4Ever CRM
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          You are signed in but have no role assigned. Please contact an admin.
        </p>
        <button
          onClick={() => {
            useAuthStore.getState().logout();
          }}
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // Public routes
  { path: "/login", element: <LoginPage /> },
  { path: "/invite/accept/:token", element: <AcceptInvitePage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // Dashboard redirect
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <DashboardRedirect /> }],
  },

  // Admin routes (uses inline layout — existing AdminDashboard has its own layout)
  {
    element: <AdminRoute />,
    children: [{ path: "/admin", element: <AdminDashboard /> }],
  },

  // CRM Manager routes — uses AppLayout sidebar
  {
    element: <CrmRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/crm", element: <CrmDashboard /> },
          { path: "/crm/customers", element: <CustomersPage /> },
          {
            path: "/crm/customers/segments/:segment",
            element: <CustomerSegmentPage />,
          },
          { path: "/crm/customers/:id", element: <CustomerDetailPage /> },
          { path: "/crm/service-requests", element: <ServiceRequestsPage /> },
          { path: "/crm/campaigns", element: <CampaignsPage /> },
          { path: "/crm/tickets", element: <TicketsPage /> },
          { path: "/crm/analytics", element: <AnalyticsPage /> },
          { path: "/crm/reviews", element: <ReviewsPage /> },
          { path: "/crm/loyalty", element: <LoyaltyPage /> },
          { path: "/crm/trends", element: <TrendsPage /> },
          { path: "/crm/templates", element: <TemplatesPage /> },
          { path: "/crm/follow-ups", element: <FollowUpsPage /> },
          { path: "/crm/support", element: <SupportInboxPage /> },
          { path: "/crm/captains", element: <CaptainsPage /> },
          {
            path: "/crm/captains/settlements",
            element: <CaptainSettlementsPage />,
          },
          { path: "/crm/captains/:captainId", element: <CaptainDetailPage /> },
        ],
      },
    ],
  },

  // Regional Manager routes — uses AppLayout sidebar
  {
    element: <RegionalRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/regional", element: <RegionalDashboard /> },
          { path: "/regional/customers", element: <RegionalCustomersPage /> },
          { path: "/regional/technicians", element: <TechniciansPage /> },
          {
            path: "/regional/service-requests",
            element: <RegionalServiceRequestsPage />,
          },
          { path: "/regional/sla", element: <SlaPage /> },
          { path: "/regional/analytics", element: <RegionalAnalyticsPage /> },
          { path: "/regional/finance", element: <FinancePage /> },
          { path: "/regional/campaigns", element: <RegionalCampaignsPage /> },
          { path: "/regional/strategic", element: <StrategicPage /> },
          { path: "/regional/captains", element: <CaptainsPage /> },
          {
            path: "/regional/captains/settlements",
            element: <CaptainSettlementsPage />,
          },
          {
            path: "/regional/captains/:captainId",
            element: <CaptainDetailPage />,
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
