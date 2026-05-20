import { useState } from "react";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { approveChangeRequest, rejectChangeRequest } from "./api";
import { AuditTrailView } from "./AuditTrailView";
import type { SupportChangeRequest, SupportChatSession } from "./types";

interface Props {
  changeRequest: SupportChangeRequest;
  session: SupportChatSession | null;
  onApproved: (crId: string) => void;
  onRejected: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  approved: "bg-green-500/20  text-green-400  border border-green-500/30",
  rejected: "bg-red-500/20    text-red-400    border border-red-500/30",
  executed: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  executed: "✓ Applied",
};

const CHANGE_LABELS: Record<string, string> = {
  address_update: "Address Update",
  beneficiary_update: "Beneficiary Update",
};

function DataRow({
  label,
  old: oldVal,
  next,
}: {
  label: string;
  old?: string;
  next?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {oldVal && (
          <span className="text-sm text-slate-400 line-through">{oldVal}</span>
        )}
        {oldVal && next && (
          <ArrowRight size={12} className="text-slate-500 flex-shrink-0" />
        )}
        {next && <span className="text-sm text-white font-medium">{next}</span>}
      </div>
    </div>
  );
}

export function ChangeRequestReviewPanel({
  changeRequest: cr,
  session,
  onApproved,
  onRejected,
}: Props) {
  // Local status so the panel flips to read-only immediately after the agent acts,
  // without needing a round-trip re-fetch before the UI updates.
  const [crStatus, setCrStatus] = useState(cr.status);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const isPending = crStatus === "pending";

  async function handleApprove() {
    setLoading("approve");
    try {
      await approveChangeRequest(cr._id);
      setCrStatus("approved"); // optimistic — panel flips to read-only instantly
      onApproved(cr._id);
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setRejectError("Please provide a reason (min 5 characters).");
      return;
    }
    setRejectError("");
    setLoading("reject");
    try {
      await rejectChangeRequest(cr._id, rejectReason.trim());
      onRejected();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Scrollable content body ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {CHANGE_LABELS[cr.changeType] || cr.changeType}
            </p>
            <p className="text-lg font-bold text-white mt-0.5">
              SR {cr.serviceRequestRef}
            </p>
            <p className="text-sm text-slate-400">{cr.customerName}</p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[crStatus]}`}
          >
            {STATUS_LABEL[crStatus] ?? crStatus}
          </span>
        </div>

        {/* Change diff */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Requested Changes
          </p>

          {cr.changeType === "address_update" && (
            <>
              <DataRow
                label="Address"
                old={cr.currentData.address as string}
                next={cr.requestedData.newAddress as string}
              />
              {cr.requestedData.newCity && (
                <DataRow
                  label="City"
                  old={cr.currentData.city as string}
                  next={cr.requestedData.newCity as string}
                />
              )}
            </>
          )}

          {cr.changeType === "beneficiary_update" &&
            (() => {
              const targetType = cr.requestedData.targetType as
                | string
                | undefined;

              if (targetType === "other") {
                // self → beneficiary
                return (
                  <>
                    <DataRow
                      label="Request Type"
                      old="Self"
                      next="Beneficiary"
                    />
                    <DataRow
                      label="Beneficiary Name"
                      old={(cr.currentData.userName as string) || "—"}
                      next={cr.requestedData.beneficiaryName as string}
                    />
                    <DataRow
                      label="Beneficiary Phone"
                      old={(cr.currentData.userPhone as string) || "—"}
                      next={cr.requestedData.beneficiaryPhone as string}
                    />
                    {(cr.requestedData.newAddress as string) && (
                      <DataRow
                        label="Service Address"
                        old={(cr.currentData.address as string) || "—"}
                        next={cr.requestedData.newAddress as string}
                      />
                    )}
                  </>
                );
              }

              if (targetType === "self") {
                // beneficiary → self
                return (
                  <>
                    <DataRow
                      label="Request Type"
                      old="Beneficiary"
                      next="Self"
                    />
                    <DataRow
                      label="Your Name"
                      old={(cr.currentData.beneficiaryName as string) || "—"}
                      next={cr.requestedData.ownerName as string}
                    />
                    <DataRow
                      label="Your Phone"
                      old={(cr.currentData.beneficiaryPhone as string) || "—"}
                      next={cr.requestedData.ownerPhone as string}
                    />
                    {(cr.requestedData.newAddress as string) && (
                      <DataRow
                        label="Service Address"
                        old={(cr.currentData.address as string) || "—"}
                        next={cr.requestedData.newAddress as string}
                      />
                    )}
                  </>
                );
              }

              // Legacy: no targetType (old flow submissions)
              return (
                <>
                  <DataRow
                    label="Beneficiary Name"
                    old={(cr.currentData.beneficiaryName as string) || "—"}
                    next={cr.requestedData.beneficiaryName as string}
                  />
                  <DataRow
                    label="Beneficiary Phone"
                    old={(cr.currentData.beneficiaryPhone as string) || "—"}
                    next={cr.requestedData.beneficiaryPhone as string}
                  />
                </>
              );
            })()}
        </div>

        {/* Chat context — last 6 messages from the bot session */}
        {session && session.messages.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Chat Context
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {session.messages.slice(-6).map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.senderRole === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={`text-xs px-2.5 py-1.5 rounded-xl max-w-[80%] ${
                      m.senderRole === "customer"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection reason — shown when this request was previously rejected */}
        {cr.rejectionReason && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-400 mb-1">
              Rejection Reason
            </p>
            <p className="text-sm text-red-300">{cr.rejectionReason}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            Submitted {new Date(cr.createdAt).toLocaleString()}
          </div>
          {cr.reviewedAt && (
            <div>Reviewed {new Date(cr.reviewedAt).toLocaleString()}</div>
          )}
          {cr.executedAt && (
            <div>Applied {new Date(cr.executedAt).toLocaleString()}</div>
          )}
        </div>

        {/* Audit trail */}
        <AuditTrailView trail={cr.auditTrail} />
      </div>

      {/* ── Sticky action footer — always visible ────────────────────── */}
      {isPending ? (
        <div className="flex-shrink-0 border-t border-slate-800 bg-slate-950 p-4 space-y-3">
          <div>
            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
              placeholder="Rejection reason — required if rejecting (min 5 chars)…"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
            />
            {rejectError && (
              <p className="text-xs text-red-400 mt-1">{rejectError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-500/40 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              <XCircle size={14} />
              {loading === "reject" ? "Rejecting…" : "Reject"}
            </button>
            <button
              onClick={handleApprove}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={14} />
              {loading === "approve" ? "Approving…" : "Approve & Apply"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 border-t border-slate-800 bg-slate-950 px-4 py-3 flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[crStatus]}`}
          >
            {STATUS_LABEL[crStatus] ?? crStatus}
          </span>
          {cr.reviewedByName && (
            <span className="text-xs text-slate-500">
              by {cr.reviewedByName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
