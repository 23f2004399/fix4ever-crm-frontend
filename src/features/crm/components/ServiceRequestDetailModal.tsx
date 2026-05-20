/**
 * View More modal — displays full service request details from schema
 */
import type { ServiceRequestDetail } from "../types";

interface Props {
  sr: ServiceRequestDetail | null | undefined;
  isLoading: boolean;
  isError?: boolean;
  onClose: () => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div
      className={`flex gap-4 py-2 border-b border-slate-800/50 last:border-0 ${label ? "justify-between" : ""}`}
    >
      {label && (
        <span className="text-slate-500 text-sm shrink-0">{label}</span>
      )}
      <span
        className={`text-slate-200 text-sm break-words ${label ? "text-right" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-slate-300 font-medium text-sm">{title}</h4>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

export function ServiceRequestDetailModal({
  sr,
  isLoading,
  isError,
  onClose,
}: Props) {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-5/6" />
            <div className="h-4 bg-slate-800 rounded w-4/6" />
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!sr) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
          <p className="text-slate-400">
            {isError
              ? "Failed to load service request details. Please try again."
              : "Service request not found."}
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const customer =
    typeof sr.customerId === "object" && sr.customerId ? sr.customerId : null;
  const customerName =
    sr.userName ?? customer?.username ?? customer?.email ?? "—";
  const customerPhone = sr.userPhone ?? customer?.phone ?? "—";
  const amount =
    sr.adminFinalPrice ??
    sr.paymentBreakdown?.totalCost ??
    sr.vendorPriceBreakdown?.totalAmount ??
    "—";
  const amountStr = typeof amount === "number" ? `₹${amount}` : String(amount);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="text-white font-semibold text-lg">
            Service Request — {sr.request_id}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information">
            <DetailRow label="Request ID" value={sr.request_id} />
            <DetailRow label="Status" value={sr.status} />
            <DetailRow label="Priority" value={sr.priority} />
            <DetailRow label="Service Type" value={sr.serviceType} />
            <DetailRow label="Request Type" value={sr.requestType} />
            <DetailRow label="Category" value={sr.category} />
            <DetailRow label="Schedule Status" value={sr.scheduleStatus} />
            <DetailRow label="Payment Status" value={sr.paymentStatus} />
          </Section>

          {/* Device */}
          <Section title="Device">
            <DetailRow label="Title" value={sr.title} />
            <DetailRow label="Brand" value={sr.deviceBrand ?? sr.brand} />
            <DetailRow label="Model" value={sr.deviceModel ?? sr.model} />
            <DetailRow label="Device Type" value={sr.deviceType} />
            <DetailRow label="Main Problem" value={sr.mainProblem?.title} />
            <DetailRow label="Sub Problem" value={sr.subProblem?.title} />
            <DetailRow label="Level" value={sr.level} />
            <DetailRow
              label="Problem Description"
              value={sr.problemDescription}
            />
            <DetailRow label="Description" value={sr.description} />
          </Section>

          {/* Customer & Location */}
          <Section title="Customer & Location">
            <DetailRow label="Customer Name" value={customerName} />
            <DetailRow label="Phone" value={customerPhone} />
            <DetailRow
              label="Address"
              value={sr.address ?? sr.location?.address}
            />
            <DetailRow label="City" value={sr.city} />
            <DetailRow
              label="Coordinates"
              value={
                sr.customerLocation
                  ? `${sr.customerLocation.latitude}, ${sr.customerLocation.longitude}`
                  : sr.location
                    ? `${sr.location.lat}, ${sr.location.lng}`
                    : undefined
              }
            />
          </Section>

          {/* Schedule */}
          <Section title="Schedule">
            <DetailRow label="Preferred Date" value={sr.preferredDate} />
            <DetailRow label="Preferred Time" value={sr.preferredTime} />
            <DetailRow
              label="Scheduled Date"
              value={
                sr.scheduledDate
                  ? new Date(sr.scheduledDate).toLocaleDateString()
                  : undefined
              }
            />
            <DetailRow label="Scheduled Time" value={sr.scheduledTime} />
            <DetailRow label="Scheduled Slot" value={sr.scheduledSlot} />
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <DetailRow
              label="Budget"
              value={sr.budget != null ? `₹${sr.budget}` : undefined}
            />
            <DetailRow label="Final Amount" value={amountStr} />
            <DetailRow label="Coupon Code" value={sr.couponCode} />
            <DetailRow
              label="Coupon Discount"
              value={
                sr.couponDiscount != null ? `₹${sr.couponDiscount}` : undefined
              }
            />
            <DetailRow
              label="Min Price"
              value={sr.minPrice != null ? `₹${sr.minPrice}` : undefined}
            />
            <DetailRow
              label="Max Price"
              value={sr.maxPrice != null ? `₹${sr.maxPrice}` : undefined}
            />
          </Section>

          {/* Payment Breakdown */}
          {sr.paymentBreakdown && (
            <Section title="Payment Breakdown">
              <DetailRow
                label="Service Cost"
                value={
                  sr.paymentBreakdown.serviceCost != null
                    ? `₹${sr.paymentBreakdown.serviceCost}`
                    : undefined
                }
              />
              <DetailRow
                label="Component Cost"
                value={
                  sr.paymentBreakdown.componentCost != null
                    ? `₹${sr.paymentBreakdown.componentCost}`
                    : undefined
                }
              />
              <DetailRow
                label="Pickup Cost"
                value={
                  sr.paymentBreakdown.pickupCost != null
                    ? `₹${sr.paymentBreakdown.pickupCost}`
                    : undefined
                }
              />
              <DetailRow
                label="Delivery Cost"
                value={
                  sr.paymentBreakdown.deliveryCost != null
                    ? `₹${sr.paymentBreakdown.deliveryCost}`
                    : undefined
                }
              />
              <DetailRow
                label="Total Cost"
                value={
                  sr.paymentBreakdown.totalCost != null
                    ? `₹${sr.paymentBreakdown.totalCost}`
                    : undefined
                }
              />
              <DetailRow
                label="Technician Earnings"
                value={
                  sr.paymentBreakdown.technicianEarnings != null
                    ? `₹${sr.paymentBreakdown.technicianEarnings}`
                    : undefined
                }
              />
              <DetailRow
                label="Company Commission"
                value={
                  sr.paymentBreakdown.companyCommission != null
                    ? `₹${sr.paymentBreakdown.companyCommission}`
                    : undefined
                }
              />
            </Section>
          )}

          {/* Calculated Pricing */}
          {sr.calculatedPricing?.breakdown &&
            sr.calculatedPricing.breakdown.length > 0 && (
              <Section title="Calculated Pricing">
                {sr.calculatedPricing.breakdown.map((line, i) => (
                  <DetailRow key={i} label="" value={line} />
                ))}
              </Section>
            )}

          {/* Repair Details */}
          {sr.repairDetails && (
            <Section title="Repair Details">
              <DetailRow
                label="Problem Identified"
                value={
                  sr.repairDetails.problemIdentified != null
                    ? String(sr.repairDetails.problemIdentified)
                    : undefined
                }
              />
              <DetailRow
                label="Repair Started"
                value={
                  sr.repairDetails.repairStarted != null
                    ? String(sr.repairDetails.repairStarted)
                    : undefined
                }
              />
              <DetailRow
                label="Repair Completed"
                value={
                  sr.repairDetails.repairCompleted != null
                    ? String(sr.repairDetails.repairCompleted)
                    : undefined
                }
              />
            </Section>
          )}

          {/* Relational Behaviors */}
          {sr.relationalBehaviors && sr.relationalBehaviors.length > 0 && (
            <Section title="Relational Behaviors">
              {sr.relationalBehaviors.map((rb) => (
                <DetailRow
                  key={rb.id}
                  label={rb.title}
                  value={
                    rb.pricing
                      ? `₹${rb.pricing.min_price}-${rb.pricing.max_price} (${rb.repair ? "Repair" : ""} ${rb.replacement ? "Replacement" : ""})`
                      : undefined
                  }
                />
              ))}
            </Section>
          )}

          {/* Issue Images */}
          {sr.issueImages && sr.issueImages.length > 0 && (
            <Section title="Issue Images">
              <div className="flex flex-wrap gap-2">
                {sr.issueImages.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm break-all"
                  >
                    Image {i + 1}
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Timestamps */}
          <Section title="Timestamps">
            <DetailRow
              label="Created"
              value={
                sr.createdAt
                  ? new Date(sr.createdAt).toLocaleString()
                  : undefined
              }
            />
            <DetailRow
              label="Accepted At"
              value={
                sr.acceptedAt
                  ? new Date(sr.acceptedAt).toLocaleString()
                  : undefined
              }
            />
            <DetailRow
              label="Admin Pricing Set At"
              value={
                sr.adminPricingSetAt
                  ? new Date(sr.adminPricingSetAt).toLocaleString()
                  : undefined
              }
            />
          </Section>
        </div>
      </div>
    </div>
  );
}
