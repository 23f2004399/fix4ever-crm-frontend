/**
 * Admin Dashboard
 *
 * Admin-only page with Users, Invitations, and Customers tabs.
 * Users tab shows UserTable for role management (with Feature Policy checkboxes).
 * Invitations tab shows InvitationsList.
 * Customers tab shows a searchable customer list with full profile view.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserTable } from "../components/UserTable";
import { InvitationsList } from "../components/InvitationsList";
import { InviteUserModal } from "../components/InviteUserModal";
import { CustomerProfileView } from "@/features/crm/components/CustomerProfileView";
import { api } from "@/shared/config/axios";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, X } from "lucide-react";

type AdminTab = "users" | "invitations" | "customers";

// ─── Feature Policy Checkboxes ────────────────────────────────────────────────

const CUSTOMER_DATA_POLICIES: {
  key: string;
  label: string;
  description: string;
}[] = [
  {
    key: "customers.read",
    label: "View Customer Profiles",
    description: "Access customer profile, wallet, and subscription details",
  },
  {
    key: "customers.repair_history.view",
    label: "View Repair History",
    description: "Access full service request history per customer",
  },
  {
    key: "customers.payments.view",
    label: "View Payments & Invoices",
    description: "Access payment transactions and invoice data",
  },
];

function PolicyCheckboxesInfo() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-white mb-1">
        Customer Data Access — Policy Reference
      </h3>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        These permissions control access to customer data features. Assign them
        via permission overrides per user (click a user row in the table below).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CUSTOMER_DATA_POLICIES.map((p) => (
          <div
            key={p.key}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-2.5 h-2.5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white text-xs font-semibold">{p.label}</p>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              {p.description}
            </p>
            <code className="mt-2 block text-xs text-slate-600 font-mono">
              {p.key}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customers Tab ────────────────────────────────────────────────────────────

type ApiCustomer = {
  _id: string;
  username?: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
};

function CustomersTab() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", search],
    queryFn: () =>
      api
        .get("/admin/customers", {
          params: { search: search || undefined, limit: 30 },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const customers: ApiCustomer[] =
    (data as { data?: ApiCustomer[] })?.data ?? [];

  if (selectedId) {
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
          Close profile
        </button>
        <CustomerProfileView
          customerId={selectedId}
          role="admin"
          backTo="#"
          backLabel="Back to list"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500 text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Name", "Email", "Phone", "Status", "Joined", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-200 text-sm font-medium">
                      {c.username ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-lg border ${
                          c.isActive !== false
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {c.isActive !== false ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(c._id)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
    setUserMenuOpen(false);
  }

  const tabMeta: Record<AdminTab, { title: string; description: string }> = {
    users: {
      title: "User role management",
      description:
        "Assign roles and permissions to existing users or invite new users by email.",
    },
    invitations: {
      title: "Invitations",
      description: "Manage pending and past invitations.",
    },
    customers: {
      title: "Customer Profiles",
      description:
        "View full customer profiles, repair history, and payment records.",
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/admin"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm tracking-tight">
                  Fix4Ever CRM
                </h1>
                <p className="text-slate-500 text-xs">Admin console</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden sm:flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 text-sm font-medium overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user?.username ?? user?.email ?? "A")[0].toUpperCase()
                    )}
                  </div>
                  <div className="text-left max-w-[120px]">
                    <p className="text-white text-sm font-medium truncate">
                      {user?.username ?? user?.email}
                    </p>
                    <span className="text-xs text-emerald-400/90">Admin</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-1 w-48 py-1 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 animate-in-slide-up">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-white text-sm font-medium truncate">
                          {user?.username ?? user?.email}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 text-sm text-left transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CRM Portals section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-1">Portals</h2>
          <p className="text-slate-500 text-sm mb-5">
            Enter a portal to perform all operations available to that role.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/crm")}
              className="group relative text-left rounded-2xl border border-slate-700/80 bg-slate-900 hover:border-blue-500/50 hover:bg-slate-800/70 p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <svg
                  className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-base mb-1">
                CRM Portal
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Customers · Campaigns · Tickets · Analytics · Reviews · Loyalty
                · Follow-Ups · Support
              </p>
            </button>

            <button
              onClick={() => navigate("/regional")}
              className="group relative text-left rounded-2xl border border-slate-700/80 bg-slate-900 hover:border-violet-500/50 hover:bg-slate-800/70 p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <svg
                  className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-base mb-1">
                Regional Portal
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Technicians · Service Requests · SLA Monitor · Analytics ·
                Finance · Campaigns · Strategic
              </p>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-sm text-slate-500 mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="hover:text-slate-400 transition-colors"
          >
            Dashboard
          </Link>
          <svg
            className="w-4 h-4 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-slate-400 font-medium">
            {tabMeta[activeTab].title}
          </span>
        </nav>

        {/* Page header + tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {tabMeta[activeTab].title}
            </h2>
            <p className="text-slate-400 mt-1.5 text-sm leading-relaxed">
              {tabMeta[activeTab].description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-700/80 p-1 bg-slate-800/40">
              {(["users", "invitations", "customers"] as AdminTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      activeTab === tab
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
            {activeTab !== "customers" && (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Invite user
              </button>
            )}
          </div>
        </div>

        {/* Role cards (users tab only) */}
        {activeTab === "users" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <InfoCard
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                label="CRM Manager"
                description="Customer & technician oversight"
                color="text-blue-400"
                bg="bg-slate-800/60 border-slate-700/80 hover:border-blue-500/30"
              />
              <InfoCard
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
                label="Editor"
                description="Content & notification management"
                color="text-emerald-400"
                bg="bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/30"
              />
              <InfoCard
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                }
                label="Regional Manager"
                description="Region-based service oversight"
                color="text-violet-400"
                bg="bg-slate-800/60 border-slate-700/80 hover:border-violet-500/30"
              />
            </div>

            {/* Feature policy checkboxes reference */}
            <PolicyCheckboxesInfo />
          </>
        )}

        {activeTab === "users" && <UserTable />}
        {activeTab === "invitations" && <InvitationsList />}
        {activeTab === "customers" && <CustomersTab />}
      </main>

      {inviteModalOpen && (
        <InviteUserModal onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  description,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border p-5 transition-all duration-200 ${bg}`}>
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-white text-sm font-semibold">{label}</p>
      <p className="text-slate-500 text-xs mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
