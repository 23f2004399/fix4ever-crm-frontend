/**
 * App Shell Layout
 *
 * Responsive sidebar navigation + top bar for authenticated users.
 * Navigation items are filtered based on the user's roles (crm_manager / regional_manager).
 */
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, useUIStore } from "@/store";
import { SupportNotificationBanner } from "@/features/crm/support/SupportNotificationBanner";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: string[];
}

function Icon({ d, className = "w-5 h-5" }: { d: string; className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  // Admin
  {
    label: "Admin Console",
    to: "/admin",
    icon: (
      <Icon d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    ),
    roles: ["admin", "super_admin"],
  },
  // CRM Manager
  {
    label: "CRM Dashboard",
    to: "/crm",
    icon: (
      <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Customers",
    to: "/crm/customers",
    icon: (
      <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Service Requests",
    to: "/crm/service-requests",
    icon: (
      <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "SR Trends",
    to: "/crm/trends",
    icon: (
      <Icon d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Campaigns",
    to: "/crm/campaigns",
    icon: (
      <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Templates",
    to: "/crm/templates",
    icon: (
      <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Follow-Ups",
    to: "/crm/follow-ups",
    icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Tickets",
    to: "/crm/tickets",
    icon: (
      <Icon d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Analytics",
    to: "/crm/analytics",
    icon: (
      <Icon d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Reviews",
    to: "/crm/reviews",
    icon: (
      <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Loyalty",
    to: "/crm/loyalty",
    icon: (
      <Icon d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Support Inbox",
    to: "/crm/support",
    icon: (
      <Icon d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  {
    label: "Captains",
    to: "/crm/captains",
    icon: (
      <Icon d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    ),
    roles: ["crm_manager", "admin", "super_admin"],
  },
  // Regional Manager
  {
    label: "Regional Dashboard",
    to: "/regional",
    icon: (
      <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Customers",
    to: "/regional/customers",
    icon: (
      <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Technicians",
    to: "/regional/technicians",
    icon: (
      <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Service Requests",
    to: "/regional/service-requests",
    icon: (
      <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "SLA Monitor",
    to: "/regional/sla",
    icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Analytics",
    to: "/regional/analytics",
    icon: (
      <Icon d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Finance",
    to: "/regional/finance",
    icon: (
      <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Campaigns",
    to: "/regional/campaigns",
    icon: (
      <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Strategic",
    to: "/regional/strategic",
    icon: <Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    roles: ["regional_manager", "admin", "super_admin"],
  },
  {
    label: "Captains",
    to: "/regional/captains",
    icon: (
      <Icon d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    ),
    roles: ["regional_manager", "admin", "super_admin"],
  },
];

export function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const userRoles = [user?.role ?? "", ...(user?.roles ?? [])];
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles.some((r) => userRoles.includes(r))) return false;
    if (isAdmin) {
      if (location.pathname.startsWith("/crm"))
        return item.to === "/admin" || item.to.startsWith("/crm");
      if (location.pathname.startsWith("/regional"))
        return item.to === "/admin" || item.to.startsWith("/regional");
    }
    return true;
  });

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      <SupportNotificationBanner onNavigate={navigate} />
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 h-screen sticky top-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Icon d="M4 6h16M4 12h16M4 18h16" className="w-4 h-4" />
          </button>
          {sidebarOpen && (
            <span className="ml-3 text-white font-bold text-lg tracking-tight">
              Fix4Ever
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length === 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 text-sm font-semibold">
                {(user?.username ?? user?.email ?? "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user?.username ?? user?.email}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm transition-colors flex items-center gap-2"
            >
              <Icon
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                className="w-4 h-4"
              />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center px-6 gap-4 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 px-2 py-1 rounded-md bg-slate-800 border border-slate-700">
              {user?.roles?.map((r) => r.replace("_", " ")).join(", ") ||
                user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
