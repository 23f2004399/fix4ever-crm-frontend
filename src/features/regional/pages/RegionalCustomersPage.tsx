/**
 * RegionalCustomersPage
 *
 * Region-scoped customer list for Regional Managers.
 * Clicking a customer opens the shared CustomerProfileView in "regional" mode,
 * which hides block/unblock and refund actions.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, X } from "lucide-react";
import { api } from "@/shared/config/axios";
import { useAuthStore } from "@/features/auth/store/authStore";
import { CustomerProfileView } from "@/features/crm/components/CustomerProfileView";

type ApiCustomer = {
  _id: string;
  username?: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  region?: string;
  createdAt?: string;
};

export function RegionalCustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const region = user?.region ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["regional", "customers", search, region],
    queryFn: () =>
      api
        .get("/crm/customers", {
          params: {
            search: search || undefined,
            region: region || undefined,
            limit: 30,
          },
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
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
          Back to customers list
        </button>
        <CustomerProfileView
          customerId={selectedId}
          role="regional"
          backTo="/regional/customers"
          backLabel="Back to Customers"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Customers
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          {region
            ? `Showing customers in region: ${region}`
            : "All customers accessible to your region"}
        </p>
      </div>

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
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500 text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Status",
                    "Region",
                    "Joined",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
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
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {c.region ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(c._id)}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
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
