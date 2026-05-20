import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useCaptain,
  useCaptainWallet,
  useCaptainTransactions,
  useCaptainWalletAnalytics,
  useCaptainLiveOrders,
  useCaptainHistory,
  useApproveCaptain,
  useRejectCaptain,
  useSuspendCaptain,
  useReactivateCaptain,
  useUpdateCaptainInfo,
} from "../hooks";
import { PermissionGate } from "@/shared/components/PermissionGate";
import type { Captain, CaptainTransaction } from "../types";

type TabId =
  | "profile"
  | "documents"
  | "onboarding"
  | "live-orders"
  | "wallet"
  | "history";

const TABS: { id: TabId; label: string; permission?: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents", permission: "captains.read" },
  { id: "onboarding", label: "Onboarding", permission: "captains.read" },
  {
    id: "live-orders",
    label: "Live Orders",
    permission: "captains.live_orders",
  },
  { id: "wallet", label: "Wallet", permission: "captains.wallet_view" },
  { id: "history", label: "Trip History", permission: "captains.history" },
];

const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "In Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  "Not Started": "bg-slate-800 text-slate-500 border-slate-700",
};

const TX_TYPE_COLORS: Record<string, string> = {
  credit: "text-emerald-400",
  debit: "text-red-400",
  settlement: "text-blue-400",
  refund: "text-amber-400",
  adjustment: "text-purple-400",
};

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-slate-200 text-sm">{value ?? "—"}</p>
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h3 className="text-slate-200 font-semibold text-sm">{title}</h3>
      {children}
    </div>
  );
}

function ProfileTab({ captain }: { captain: Captain }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    "personalInfo.fullName": captain.personalInfo?.fullName ?? "",
    "personalInfo.phone": captain.personalInfo?.phone ?? "",
    "personalInfo.alternatePhone": captain.personalInfo?.alternatePhone ?? "",
    "personalInfo.residentialAddress":
      captain.personalInfo?.residentialAddress ?? "",
  });
  const updateInfo = useUpdateCaptainInfo(captain._id);

  function handleSave() {
    updateInfo.mutate(draft, { onSuccess: () => setEditing(false) });
  }

  return (
    <div className="space-y-4">
      <Section title="Personal Information">
        <div className="grid grid-cols-2 gap-4">
          {editing ? (
            <>
              {(
                [
                  ["Full Name", "personalInfo.fullName"],
                  ["Phone", "personalInfo.phone"],
                  ["Alternate Phone", "personalInfo.alternatePhone"],
                  ["Address", "personalInfo.residentialAddress"],
                ] as [string, keyof typeof draft][]
              ).map(([label, key]) => (
                <div key={key}>
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <input
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <Field label="Full Name" value={captain.personalInfo?.fullName} />
              <Field label="Email" value={captain.personalInfo?.email} />
              <Field label="Phone" value={captain.personalInfo?.phone} />
              <Field
                label="Alternate Phone"
                value={captain.personalInfo?.alternatePhone}
              />
              <Field
                label="Address"
                value={captain.personalInfo?.residentialAddress}
              />
            </>
          )}
        </div>
        <PermissionGate permission="captains.update">
          <div className="flex gap-2 pt-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updateInfo.isPending}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateInfo.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors"
              >
                Edit Info
              </button>
            )}
          </div>
        </PermissionGate>
      </Section>

      <Section title="Vehicle Details">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Vehicle Type"
            value={captain.vehicleDetails?.vehicleType}
          />
          <Field
            label="Brand / Model"
            value={`${captain.vehicleDetails?.vehicleBrand ?? ""} ${captain.vehicleDetails?.vehicleModel ?? ""}`}
          />
          <Field label="Year" value={captain.vehicleDetails?.vehicleYear} />
          <Field
            label="License Plate"
            value={captain.vehicleDetails?.licensePlate}
          />
          <Field label="Color" value={captain.vehicleDetails?.vehicleColor} />
        </div>
      </Section>

      <Section title="Service Preferences">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Working Hours"
            value={
              captain.servicePreferences?.workingHours
                ? `${captain.servicePreferences.workingHours.start} – ${captain.servicePreferences.workingHours.end}`
                : undefined
            }
          />
          <Field
            label="Working Days"
            value={captain.servicePreferences?.workingDays?.join(", ")}
          />
          <Field
            label="Service Areas"
            value={captain.servicePreferences?.serviceAreas?.join(", ")}
          />
          <Field
            label="Max Travel Distance"
            value={
              captain.servicePreferences?.maxTravelDistance != null
                ? `${captain.servicePreferences.maxTravelDistance} km`
                : undefined
            }
          />
        </div>
      </Section>

      <Section title="Rating">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-bold text-amber-400">
            {captain.averageRating?.toFixed(1) ?? "—"}
          </span>
          <div>
            <p className="text-amber-400 text-sm">★★★★★</p>
            <p className="text-slate-500 text-xs">
              {captain.totalReviews} reviews
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(captain.ratingBreakdown ?? {}).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <p className="text-slate-400 text-xs capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="text-slate-200 text-xs font-medium">
                {typeof val === "number" ? val.toFixed(1) : "—"}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function DocumentsTab({ captain }: { captain: Captain }) {
  const docs = [
    {
      label: "Registration Certificate",
      url: captain.vehicleDetails?.registrationCertificate,
    },
    {
      label: "Insurance Document",
      url: captain.vehicleDetails?.insuranceDocument,
    },
    {
      label: "Driving License",
      url: captain.drivingLicenseDetails?.licensePhoto,
    },
    {
      label: "Government ID Proof",
      url: captain.identityVerification?.governmentIdProof,
    },
    {
      label: "Selfie Verification",
      url: captain.identityVerification?.selfieVerification,
    },
    {
      label: "Cancelled Cheque",
      url: captain.bankDetails?.cancelledCheque,
    },
  ];

  return (
    <div className="space-y-4">
      <Section title="Identity Verification">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="ID Type"
            value={captain.identityVerification?.governmentIdType}
          />
          <Field
            label="ID Number"
            value={captain.identityVerification?.governmentIdNumber}
          />
          <Field
            label="Verification Status"
            value={captain.identityVerification?.verificationStatus}
          />
          <Field
            label="License Number"
            value={captain.drivingLicenseDetails?.licenseNumber}
          />
          <Field
            label="License Class"
            value={captain.drivingLicenseDetails?.licenseClass}
          />
          <Field
            label="License Expiry"
            value={
              captain.drivingLicenseDetails?.expiryDate
                ? new Date(
                    captain.drivingLicenseDetails.expiryDate,
                  ).toLocaleDateString()
                : undefined
            }
          />
          <Field
            label="Commercial License"
            value={
              captain.drivingLicenseDetails?.isCommercial !== undefined
                ? captain.drivingLicenseDetails.isCommercial
                  ? "Yes"
                  : "No"
                : undefined
            }
          />
        </div>
      </Section>

      <Section title="Documents">
        <div className="grid grid-cols-2 gap-3">
          {docs.map(({ label, url }) => (
            <div
              key={label}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3"
            >
              <p className="text-slate-400 text-xs mb-2">{label}</p>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  View Document ↗
                </a>
              ) : (
                <p className="text-slate-600 text-xs">Not uploaded</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Bank Details">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Account Holder"
            value={captain.bankDetails?.accountHolderName}
          />
          <Field label="Bank Name" value={captain.bankDetails?.bankName} />
          <Field
            label="Account Number"
            value={captain.bankDetails?.accountNumber}
          />
          <Field label="IFSC Code" value={captain.bankDetails?.ifscCode} />
          <Field label="Branch" value={captain.bankDetails?.branchName} />
          <Field
            label="Account Type"
            value={captain.bankDetails?.accountType}
          />
        </div>
      </Section>
    </div>
  );
}

function OnboardingTab({ captain }: { captain: Captain }) {
  const approve = useApproveCaptain(captain._id);
  const reject = useRejectCaptain(captain._id);
  const suspend = useSuspendCaptain(captain._id);
  const reactivate = useReactivateCaptain(captain._id);

  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const isSuspended = captain.reviewComments?.startsWith("SUSPENDED:");

  return (
    <div className="space-y-4">
      <Section title="Onboarding Status">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Current Status" value={captain.onboardingStatus} />
          <Field
            label="Submitted At"
            value={
              captain.submittedAt
                ? new Date(captain.submittedAt).toLocaleString()
                : undefined
            }
          />
          <Field
            label="Reviewed At"
            value={
              captain.reviewedAt
                ? new Date(captain.reviewedAt).toLocaleString()
                : undefined
            }
          />
          <Field label="Review Comments" value={captain.reviewComments} />
        </div>
      </Section>

      <PermissionGate permission="captains.approve">
        <Section title="Onboarding Actions">
          {action === null && (
            <div className="flex gap-2 flex-wrap">
              {captain.onboardingStatus === "In Review" && (
                <>
                  <button
                    onClick={() => setAction("approve")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setAction("reject")}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm rounded-xl transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <PermissionGate permission="captains.suspend">
                {!isSuspended && captain.onboardingStatus === "Approved" && (
                  <button
                    onClick={() => setAction("suspend")}
                    className="px-4 py-2 bg-orange-600/80 hover:bg-orange-600 text-white text-sm rounded-xl transition-colors"
                  >
                    Suspend
                  </button>
                )}
                {isSuspended && (
                  <button
                    onClick={() => reactivate.mutate()}
                    disabled={reactivate.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    {reactivate.isPending ? "Reactivating…" : "Reactivate"}
                  </button>
                )}
              </PermissionGate>
            </div>
          )}

          {action === "approve" && (
            <div className="space-y-3">
              <textarea
                placeholder="Optional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm resize-none h-20 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    approve.mutate(notes || undefined, {
                      onSuccess: () => setAction(null),
                    })
                  }
                  disabled={approve.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {approve.isPending ? "Approving…" : "Confirm Approve"}
                </button>
                <button
                  onClick={() => setAction(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {action === "reject" && (
            <div className="space-y-3">
              <textarea
                placeholder="Reason for rejection (required)…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm resize-none h-20 focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    reject.mutate(rejectReason, {
                      onSuccess: () => {
                        setAction(null);
                        setRejectReason("");
                      },
                    })
                  }
                  disabled={reject.isPending || rejectReason.trim().length < 5}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {reject.isPending ? "Rejecting…" : "Confirm Reject"}
                </button>
                <button
                  onClick={() => setAction(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {action === "suspend" && (
            <div className="space-y-3">
              <textarea
                placeholder="Reason for suspension (required)…"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm resize-none h-20 focus:outline-none focus:border-orange-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    suspend.mutate(suspendReason, {
                      onSuccess: () => {
                        setAction(null);
                        setSuspendReason("");
                      },
                    })
                  }
                  disabled={
                    suspend.isPending || suspendReason.trim().length < 5
                  }
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {suspend.isPending ? "Suspending…" : "Confirm Suspend"}
                </button>
                <button
                  onClick={() => setAction(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>
      </PermissionGate>
    </div>
  );
}

function LiveOrdersTab({ captainId }: { captainId: string }) {
  const { data, isLoading } = useCaptainLiveOrders(captainId);
  const orders = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
        Loading live orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center py-16 text-slate-500 text-sm">
        No active orders assigned to this captain.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order: Record<string, unknown>) => (
        <div
          key={String(order._id)}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-200 font-medium text-sm">
                {String(order.request_id ?? order._id)}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {String(order.serviceType ?? "—")} ·{" "}
                {order.createdAt
                  ? new Date(String(order.createdAt)).toLocaleString()
                  : "—"}
              </p>
            </div>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
              {String(order.status ?? "—")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WalletTab({ captainId }: { captainId: string }) {
  const { data: walletRes } = useCaptainWallet(captainId);
  const { data: analyticsRes } = useCaptainWalletAnalytics(captainId);
  const { data: txRes } = useCaptainTransactions(captainId, { limit: 10 });

  const wallet = walletRes?.data;
  const analytics = analyticsRes?.data;
  const transactions: CaptainTransaction[] = txRes?.data ?? [];

  return (
    <div className="space-y-4">
      {wallet && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Available Balance</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              ₹{wallet.availableBalance?.toLocaleString("en-IN") ?? 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Total Earned</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{wallet.totalEarned?.toLocaleString("en-IN") ?? 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Total Withdrawn</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{wallet.totalWithdrawn?.toLocaleString("en-IN") ?? 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Pending Settlement</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              ₹{wallet.pendingSettlement?.toLocaleString("en-IN") ?? 0}
            </p>
          </div>
        </div>
      )}

      {analytics && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-slate-200 font-semibold text-sm mb-3">
            Earnings Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-xs">This Month</p>
              <p className="text-xl font-bold text-white mt-0.5">
                ₹{analytics.thisMonth?.total?.toLocaleString("en-IN") ?? 0}
              </p>
              <p className="text-slate-500 text-xs">
                {analytics.thisMonth?.trips ?? 0} trips
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">This Year</p>
              <p className="text-xl font-bold text-white mt-0.5">
                ₹{analytics.thisYear?.total?.toLocaleString("en-IN") ?? 0}
              </p>
              <p className="text-slate-500 text-xs">
                {analytics.thisYear?.trips ?? 0} trips
              </p>
            </div>
            {Object.entries(analytics.byTripType ?? {}).map(([type, data]) => (
              <div key={type}>
                <p className="text-slate-400 text-xs capitalize">
                  {type} trips
                </p>
                <p className="text-xl font-bold text-white mt-0.5">
                  ₹
                  {(data as { total: number }).total?.toLocaleString("en-IN") ??
                    0}
                </p>
                <p className="text-slate-500 text-xs">
                  {(data as { count: number }).count ?? 0} trips
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-slate-200 font-semibold text-sm">
            Recent Transactions
          </h3>
        </div>
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
            No transactions yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-200 text-sm">{tx.description}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {tx.metadata?.tripType && `${tx.metadata.tripType} · `}
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold text-sm ${TX_TYPE_COLORS[tx.type] ?? "text-slate-200"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}₹
                    {tx.amount?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-slate-500 text-xs">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryTab({ captainId }: { captainId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCaptainHistory(captainId, { page, limit: 20 });
  const trips = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
        Loading trip history…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {trips.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            No completed trips yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {trips.map((trip: CaptainTransaction) => (
              <div
                key={trip._id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-200 text-sm">{trip.description}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {trip.metadata?.tripType && (
                      <span className="capitalize mr-1">
                        {trip.metadata.tripType}
                      </span>
                    )}
                    {trip.metadata?.serviceType && (
                      <span className="text-slate-600 mr-1">
                        · {trip.metadata.serviceType}
                      </span>
                    )}
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-emerald-400 font-semibold text-sm">
                  +₹{trip.amount?.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            Page {page} of {totalPages} · {pagination?.total} trips
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CaptainDetailPage() {
  const { captainId } = useParams<{ captainId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { data, isLoading } = useCaptain(captainId!);

  const captain: Captain | undefined = data?.data?.captain;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Loading captain profile…
      </div>
    );
  }

  if (!captain) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Captain not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          to=".."
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ← Captains
        </Link>
        <div className="flex items-center gap-4 mt-3">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 text-lg font-bold flex-shrink-0">
            {(captain.personalInfo?.fullName ?? "C")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {captain.personalInfo?.fullName ?? "—"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[captain.onboardingStatus] ?? STATUS_COLORS["Not Started"]}`}
              >
                {captain.onboardingStatus}
              </span>
              <span className="text-slate-500 text-xs">
                {captain.availability}
              </span>
              <span className="text-amber-400 text-xs">
                ★ {captain.averageRating?.toFixed(1) ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <PermissionGate key={tab.id} permission={tab.permission ?? ""}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          </PermissionGate>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <ProfileTab captain={captain} />}
      {activeTab === "documents" && (
        <PermissionGate permission="captains.read">
          <DocumentsTab captain={captain} />
        </PermissionGate>
      )}
      {activeTab === "onboarding" && (
        <PermissionGate permission="captains.read">
          <OnboardingTab captain={captain} />
        </PermissionGate>
      )}
      {activeTab === "live-orders" && (
        <PermissionGate permission="captains.live_orders">
          <LiveOrdersTab captainId={captainId!} />
        </PermissionGate>
      )}
      {activeTab === "wallet" && (
        <PermissionGate permission="captains.wallet_view">
          <WalletTab captainId={captainId!} />
        </PermissionGate>
      )}
      {activeTab === "history" && (
        <PermissionGate permission="captains.history">
          <HistoryTab captainId={captainId!} />
        </PermissionGate>
      )}
    </div>
  );
}
