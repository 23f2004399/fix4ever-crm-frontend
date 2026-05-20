/**
 * CustomerProfileView — Shared tabbed customer profile component.
 *
 * Renders 3 tabs based on caller role:
 *   Profile       — info, wallet, subscription, block/unblock (crm + admin only)
 *   Repair History — full paginated SR list with filters + detail modal
 *   Payments      — paginated payment transactions with invoice drawer
 *
 * Props:
 *   customerId  — MongoDB ObjectId string
 *   role        — "crm" | "admin" | "regional"  (controls action visibility)
 *   backTo      — optional link shown in the back button (default: "/crm/customers")
 */
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Star,
  Wrench,
  ShieldOff,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  X,
} from "lucide-react";
import type { ServiceRequestDetail } from "../types";
import {
  useCustomer,
  useBlockCustomer,
  useUnblockCustomer,
  useCustomerServiceHistory,
  useCustomerPaymentHistory,
  useServiceRequest,
} from "../hooks";
import { ServiceRequestDetailModal } from "./ServiceRequestDetailModal";

type PortalRole = "crm" | "admin" | "regional";

interface CustomerProfileViewProps {
  customerId: string;
  role?: PortalRole;
  backTo?: string;
  backLabel?: string;
}

type ActiveTab = "profile" | "repair-history" | "payments";

// ─── Status badge colours ─────────────────────────────────────────────────────

function srStatusClass(status: string) {
  if (status === "Completed")
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (["Cancelled", "Expired"].includes(status))
    return "bg-red-500/10 text-red-400 border-red-500/20";
  if (["In Progress", "Repair Started", "Repair Done"].includes(status))
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (status === "Pending")
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-slate-700 text-slate-400 border-slate-600";
}

function paymentStatusClass(status: string) {
  if (status === "Completed")
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (["Failed", "Cancelled"].includes(status))
    return "bg-red-500/10 text-red-400 border-red-500/20";
  if (status === "Refunded")
    return "bg-violet-500/10 text-violet-400 border-violet-500/20";
  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
}

function priorityClass(priority: string) {
  if (priority === "urgent")
    return "bg-red-500/10 text-red-400 border-red-500/20";
  if (priority === "high")
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (priority === "medium")
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-slate-700 text-slate-400 border-slate-600";
}

// ─── Invoice Drawer ───────────────────────────────────────────────────────────

function InvoiceLine({
  label,
  value,
  sub,
  highlight,
  negative,
  bold,
}: {
  label: ReactNode;
  value: string;
  sub?: string;
  highlight?: boolean;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span
        className={`text-sm leading-tight ${highlight ? "text-slate-300" : "text-slate-500"}`}
      >
        {label}
        {sub && <span className="block text-xs text-slate-600">{sub}</span>}
      </span>
      <span
        className={`text-sm font-${bold ? "bold" : "medium"} shrink-0 ${
          negative ? "text-emerald-400" : bold ? "text-white" : "text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InvoiceDrawer({
  payment,
  onClose,
}: {
  payment: Record<string, unknown>;
  onClose: () => void;
}) {
  const srPopulated = payment.serviceRequestId as Record<
    string,
    unknown
  > | null;
  const srId = srPopulated ? String(srPopulated._id ?? "") : "";
  const { data: srData, isLoading: srLoading } = useServiceRequest(srId);
  const fullSR = srData?.data as Record<string, unknown> | undefined;

  const gst = payment.gstBreakdown as
    | { baseAmount?: number; gstAmount?: number; gstRate?: number }
    | undefined;
  const adminPricing = fullSR?.adminPricingBreakdown as
    | Record<string, number>
    | undefined;
  const breakdown = fullSR?.paymentBreakdown as
    | Record<string, number>
    | undefined;

  const amount = Number(payment.amount ?? 0);
  const couponDiscount = Number(payment.couponDiscount ?? 0);
  const walletUsed = Number(payment.walletAmountUsed ?? 0);
  const gstAmt = gst?.gstAmount ?? 0;
  const gstRate = gst?.gstRate ?? 18;

  const serviceType = String(
    srPopulated?.serviceType ?? fullSR?.serviceType ?? "",
  );

  // Repair / service charge (base excl. GST)
  const serviceBase =
    adminPricing?.serviceChargeBase ??
    (breakdown?.serviceCost
      ? Math.round(breakdown.serviceCost / (1 + gstRate / 100))
      : undefined);
  const serviceGst =
    adminPricing?.serviceChargeGst ??
    (serviceBase != null
      ? Math.round(serviceBase * (gstRate / 100))
      : undefined);

  // Parts / component charge (base excl. GST)
  const componentBase =
    adminPricing?.componentChargeBase ??
    (breakdown?.componentCost && breakdown.componentCost > 0
      ? Math.round(
          breakdown.componentCost /
            (1 + (adminPricing?.applyComponentGst ? gstRate / 100 : 0)),
        )
      : 0);
  const componentGst =
    adminPricing?.componentChargeGst ??
    (adminPricing?.applyComponentGst && componentBase
      ? Math.round(componentBase * (gstRate / 100))
      : 0);

  // Transport fee (typically GST-inclusive, shown as-is)
  const pickupCost = breakdown?.pickupCost ?? 0;
  const deliveryCost = breakdown?.deliveryCost ?? 0;
  const transportTotal = pickupCost + deliveryCost;
  const transportLabel =
    serviceType === "pickup-drop"
      ? "Pickup & Drop Fee"
      : serviceType === "onsite"
        ? "Onsite Visit Fee"
        : null;

  // Subtotal before GST (sum of base charges + transport)
  const hasLineItems = serviceBase != null;
  const preGstSubtotal = hasLineItems
    ? (serviceBase ?? 0) + componentBase + transportTotal
    : (gst?.baseAmount ?? amount - gstAmt);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ReceiptText size={16} className="text-blue-400" />
            <h3 className="text-base font-semibold text-white">Invoice</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Meta info */}
          <div className="space-y-2">
            <InvoiceLine
              label="Transaction ID"
              value={String(payment._id ?? "—").slice(-12)}
            />
            {srPopulated && (
              <InvoiceLine
                label="Service Request"
                value={String(
                  srPopulated.request_id ??
                    String(srPopulated._id ?? "—").slice(-8),
                )}
              />
            )}
            {srPopulated && (
              <InvoiceLine
                label="Device"
                value={
                  [srPopulated.brand, srPopulated.model]
                    .filter(Boolean)
                    .join(" ") || "—"
                }
              />
            )}
            {serviceType && (
              <InvoiceLine
                label="Service Type"
                value={
                  serviceType === "pickup-drop"
                    ? "Pickup & Drop"
                    : serviceType === "onsite"
                      ? "Onsite Visit"
                      : serviceType === "visit-shop"
                        ? "Visit Shop"
                        : serviceType
                }
              />
            )}
            <InvoiceLine
              label="Payment Method"
              value={String(payment.paymentMethod ?? "—")}
            />
            <InvoiceLine
              label="Date"
              value={
                payment.createdAt
                  ? new Date(payment.createdAt as string).toLocaleString(
                      "en-IN",
                    )
                  : "—"
              }
            />
          </div>

          {/* Line items */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            {srLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {serviceBase != null && (
                  <InvoiceLine
                    highlight
                    label={
                      <>
                        Repair / Service Charge
                        {serviceGst != null && serviceGst > 0 && (
                          <span className="ml-1 text-xs text-slate-600">
                            +₹{serviceGst.toLocaleString("en-IN")} GST
                          </span>
                        )}
                      </>
                    }
                    value={`₹${serviceBase.toLocaleString("en-IN")}`}
                  />
                )}
                {componentBase > 0 && (
                  <InvoiceLine
                    highlight
                    label={
                      <>
                        Parts / Components
                        {componentGst > 0 && (
                          <span className="ml-1 text-xs text-slate-600">
                            +₹{componentGst.toLocaleString("en-IN")} GST
                          </span>
                        )}
                      </>
                    }
                    value={`₹${componentBase.toLocaleString("en-IN")}`}
                  />
                )}
                {transportTotal > 0 && transportLabel && (
                  <InvoiceLine
                    highlight
                    label={transportLabel}
                    sub="(GST inclusive)"
                    value={`₹${transportTotal.toLocaleString("en-IN")}`}
                  />
                )}
              </>
            )}

            {/* Subtotal before GST */}
            <div className="flex justify-between border-t border-slate-800/60 pt-2.5">
              <span className="text-sm text-slate-500">
                Subtotal (excl. GST)
              </span>
              <span className="text-sm text-slate-300">
                ₹{preGstSubtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {gstAmt > 0 && (
              <InvoiceLine
                label={`GST (${gstRate}%)`}
                value={`₹${gstAmt.toLocaleString("en-IN")}`}
              />
            )}

            {couponDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  Coupon Discount
                  {payment.couponCode != null && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {String(payment.couponCode)}
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium text-emerald-400">
                  −₹{couponDiscount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {walletUsed > 0 && (
              <InvoiceLine
                label="Wallet Credit"
                value={`−₹${walletUsed.toLocaleString("en-IN")}`}
                negative
              />
            )}

            <div className="flex justify-between border-t border-slate-700 pt-3">
              <span className="text-base font-semibold text-white">
                Total Paid
              </span>
              <span className="text-base font-bold text-white">
                ₹{amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-1">
            <span
              className={`text-xs px-3 py-1 rounded-lg border ${paymentStatusClass(String(payment.status ?? ""))}`}
            >
              {String(payment.status ?? "Unknown")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Repair History Tab ───────────────────────────────────────────────────────

function RepairHistoryTab({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [selectedSRId, setSelectedSRId] = useState<string | null>(null);

  const srQuery = useServiceRequest(selectedSRId ?? "");

  const { data, isLoading } = useCustomerServiceHistory(customerId, {
    status: status || undefined,
    serviceType: serviceType || undefined,
    page,
    limit: 15,
  });

  const items = (data as { data?: unknown[] })?.data ?? [];
  const pagination = (
    data as {
      pagination?: { total?: number; hasNext?: boolean; hasPrev?: boolean };
    }
  )?.pagination;
  const total = pagination?.total ?? 0;

  const SR_STATUSES = [
    "Pending",
    "Assigned",
    "In Progress",
    "Completed",
    "Cancelled",
    "Repair Started",
    "Repair Done",
    "Problem Identification",
  ];
  const SERVICE_TYPES = ["pickup-drop", "visit-shop", "onsite"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {SR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={serviceType}
          onChange={(e) => {
            setServiceType(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Types</option>
          {SERVICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/-/g, " ")}
            </option>
          ))}
        </select>
        <span className="ml-auto self-center text-xs text-slate-500">
          {total} request{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500 text-sm">
            No service requests found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    "ID",
                    "Device",
                    "Type",
                    "Status",
                    "Priority",
                    "Amount",
                    "Date",
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
                {(items as Record<string, unknown>[]).map((sr) => (
                  <tr
                    key={String(sr._id)}
                    onClick={() => setSelectedSRId(String(sr._id))}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {String(sr.request_id ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">
                      {[sr.brand, sr.model].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm capitalize">
                      {String(sr.serviceType ?? "—").replace(/-/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-lg border ${srStatusClass(String(sr.status ?? ""))}`}
                      >
                        {String(sr.status ?? "—")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sr.priority ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-lg border ${priorityClass(String(sr.priority))}`}
                        >
                          {String(sr.priority)}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">
                      {(() => {
                        const grandTotal = (
                          sr.adminPricingBreakdown as Record<
                            string,
                            number
                          > | null
                        )?.grandTotal;
                        const price =
                          grandTotal ??
                          (sr.adminFinalPrice as number | undefined) ??
                          (sr.vendorServiceCharge as number | undefined);
                        return price != null
                          ? `₹${Number(price).toLocaleString("en-IN")}`
                          : "—";
                      })()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {sr.createdAt
                        ? new Date(String(sr.createdAt)).toLocaleDateString(
                            "en-IN",
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page} · {total} total
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination?.hasNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {selectedSRId && (
        <ServiceRequestDetailModal
          sr={srQuery.data?.data as ServiceRequestDetail | undefined}
          isLoading={srQuery.isLoading}
          isError={srQuery.isError}
          onClose={() => setSelectedSRId(null)}
        />
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab({ customerId }: { customerId: string }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Record<
    string,
    unknown
  > | null>(null);

  const { data, isLoading } = useCustomerPaymentHistory(customerId, {
    status: status || undefined,
    page,
    limit: 15,
  });

  const items = (data as { data?: unknown[] })?.data ?? [];
  const pagination = (
    data as { pagination?: { total?: number; hasNext?: boolean } }
  )?.pagination;
  const total = pagination?.total ?? 0;

  const STATUSES = ["Completed", "Pending", "Failed", "Refunded", "Cancelled"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="ml-auto self-center text-xs text-slate-500">
          {total} transaction{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-slate-500 text-sm">
            No payment transactions found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    "Transaction",
                    "Service Request",
                    "Amount",
                    "Method",
                    "Status",
                    "Date",
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
                {(items as Record<string, unknown>[]).map((tx) => {
                  const sr = tx.serviceRequestId as Record<
                    string,
                    string
                  > | null;
                  return (
                    <tr
                      key={String(tx._id)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                        {String(tx._id ?? "—").slice(-10)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                        {sr?.request_id ??
                          (sr ? String(sr._id ?? "—").slice(-8) : "—")}
                      </td>
                      <td className="px-4 py-3 text-slate-200 text-sm font-semibold">
                        ₹{Number(tx.amount ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {String(tx.paymentMethod ?? "—")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-lg border ${paymentStatusClass(String(tx.status ?? ""))}`}
                        >
                          {String(tx.status ?? "—")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">
                        {tx.createdAt
                          ? new Date(String(tx.createdAt)).toLocaleDateString(
                              "en-IN",
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedPayment(tx)}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ReceiptText size={13} />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page} · {total} total
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination?.hasNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {selectedPayment && (
        <InvoiceDrawer
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({
  customerId,
  role,
}: {
  customerId: string;
  role: PortalRole;
}) {
  const { data, isLoading } = useCustomer(customerId);
  const blockMutation = useBlockCustomer();
  const unblockMutation = useUnblockCustomer();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <p className="py-12 text-center text-slate-500 text-sm">
        Customer not found.
      </p>
    );
  }

  const { customer, wallet, activeSubscription, reviewCount } =
    data.data as unknown as {
      customer: Record<string, unknown>;
      wallet: Record<string, number> | null;
      activeSubscription: Record<string, unknown> | null;
      reviewCount: number;
    };

  const canBlock = role === "crm" || role === "admin";

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-5 flex-wrap">
        <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center text-slate-200 text-xl font-bold flex-shrink-0">
          {String(customer.username ?? customer.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-white">
              {String(customer.username ?? "—")}
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-lg border ${
                customer.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {customer.isActive ? "Active" : "Blocked"}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            {String(customer.email ?? "")}
          </p>
          {!!customer.phone && (
            <p className="text-slate-500 text-sm">{String(customer.phone)}</p>
          )}
          <p className="text-slate-600 text-xs mt-1">
            Joined{" "}
            {customer.createdAt
              ? new Date(String(customer.createdAt)).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )
              : "—"}
            {customer.region ? ` · ${String(customer.region)}` : ""}
          </p>
        </div>
        {canBlock && (
          <div className="flex-shrink-0">
            {customer.isActive ? (
              <button
                onClick={() => {
                  const reason = prompt("Reason for blocking:");
                  if (reason)
                    blockMutation.mutate({ id: String(customer._id), reason });
                }}
                disabled={blockMutation.isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-50 transition-colors"
              >
                <ShieldOff size={13} /> Block
              </button>
            ) : (
              <button
                onClick={() => unblockMutation.mutate(String(customer._id))}
                disabled={unblockMutation.isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                <ShieldCheck size={13} /> Unblock
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Wallet Balance",
            value: wallet ? `₹${wallet.balance.toLocaleString("en-IN")}` : "—",
            sub: wallet
              ? `Credited ₹${wallet.totalCredited?.toLocaleString("en-IN")}`
              : "No wallet",
          },
          {
            label: "Subscription",
            value: String(
              (activeSubscription as Record<string, unknown> | null)?.status ??
                "None",
            ),
            sub: String(
              (
                (activeSubscription as Record<string, unknown> | null)
                  ?.planId as Record<string, unknown> | null
              )?.name ?? "No active plan",
            ),
          },
          { label: "Reviews", value: reviewCount, sub: "total submitted" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
            {s.sub && <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Wallet detail */}
      {wallet && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={15} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">Wallet</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Balance</p>
              <p className="text-base font-bold text-white mt-0.5">
                ₹{wallet.balance.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Credited</p>
              <p className="text-base font-semibold text-emerald-400 mt-0.5">
                +₹{(wallet.totalCredited ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Debited</p>
              <p className="text-base font-semibold text-red-400 mt-0.5">
                −₹{(wallet.totalDebited ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription */}
      {activeSubscription && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={15} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">
              Active Subscription
            </h3>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {[
              {
                label: "Plan",
                value: String(
                  (
                    (activeSubscription as Record<string, unknown>)
                      ?.planId as Record<string, unknown> | null
                  )?.name ?? "Unknown",
                ),
              },
              {
                label: "Price",
                value: ((activeSubscription as Record<string, unknown>)
                  ?.planId as Record<string, unknown> | null)
                  ? `₹${String(((activeSubscription as Record<string, unknown>)?.planId as Record<string, unknown>)?.price ?? "—")} / ${String(((activeSubscription as Record<string, unknown>)?.planId as Record<string, unknown>)?.interval ?? "—")}`
                  : "—",
              },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-slate-500">{f.label}</p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {f.value}
                </p>
              </div>
            ))}
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <span className="text-xs px-2 py-0.5 rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/20">
                {String(
                  (activeSubscription as Record<string, unknown>).status ?? "—",
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {reviewCount > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-amber-400" />
            <p className="text-sm text-slate-300">
              This customer has submitted{" "}
              <span className="font-semibold text-white">{reviewCount}</span>{" "}
              review{reviewCount !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CustomerProfileView({
  customerId,
  role = "crm",
  backTo = "/crm/customers",
}: CustomerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "profile",
      label: "Profile",
      icon: <CreditCard size={14} />,
    },
    {
      id: "repair-history",
      label: "Repair History",
      icon: <Wrench size={14} />,
    },
    {
      id: "payments",
      label: "Payments & Invoices",
      icon: <ReceiptText size={14} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back — hidden when used inline (backTo="#") */}
      <div className="flex items-center gap-3">
        {backTo !== "#" && (
          <Link
            to={backTo}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
        )}
        <h1 className="text-xl font-bold text-white">Customer Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-slate-700/80 p-1 bg-slate-800/40 w-fit gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <ProfileTab customerId={customerId} role={role} />
      )}
      {activeTab === "repair-history" && (
        <RepairHistoryTab customerId={customerId} />
      )}
      {activeTab === "payments" && <PaymentsTab customerId={customerId} />}
    </div>
  );
}
