import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Inbox, MessageSquare, History } from "lucide-react";
import { io } from "socket.io-client";
import {
  fetchChangeRequests,
  fetchChangeRequest,
  fetchSupportSessions,
  fetchSupportSession,
} from "./api";
import { ChangeRequestReviewPanel } from "./ChangeRequestReviewPanel";
import { LiveChatPanel } from "./LiveChatPanel";
import type { SupportChangeRequest, SupportChatSession } from "./types";

type Tab = "change-requests" | "live-chat" | "history";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-green-500/20  text-green-400",
  rejected: "bg-red-500/20    text-red-400",
  executed: "bg-purple-500/20 text-purple-400",
  pending_crm_review: "bg-yellow-500/20 text-yellow-400",
  crm_live: "bg-blue-500/20   text-blue-400",
  resolved: "bg-green-500/20  text-green-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  executed: "Applied",
};

const CHANGE_TYPE_LABEL: Record<string, string> = {
  address_update: "📍 Address Update",
  beneficiary_update: "👤 Beneficiary Update",
};

export function SupportInboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "change-requests",
  );

  // ── Pending change requests ──────────────────────────────────────────────────
  const [changeRequests, setChangeRequests] = useState<SupportChangeRequest[]>(
    [],
  );
  const [selectedCR, setSelectedCR] = useState<SupportChangeRequest | null>(
    null,
  );
  const [selectedCRSession, setSelectedCRSession] =
    useState<SupportChatSession | null>(null);
  const [crLoading, setCrLoading] = useState(true);

  // ── History (handled requests) ───────────────────────────────────────────────
  const [historyRequests, setHistoryRequests] = useState<
    SupportChangeRequest[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Live sessions ────────────────────────────────────────────────────────────
  const [liveSessions, setLiveSessions] = useState<SupportChatSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<SupportChatSession | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Ref so the socket handler always sees the latest selectedCR without a stale closure
  const selectedCRIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedCRIdRef.current = selectedCR?._id ?? null;
  }, [selectedCR]);

  // ── Data loaders ─────────────────────────────────────────────────────────────

  const loadChangeRequests = useCallback(async () => {
    setCrLoading(true);
    try {
      const res = await fetchChangeRequests({
        status: ["pending", "rejected"],
      });
      setChangeRequests(res.data || []);
    } finally {
      setCrLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetchChangeRequests({
        status: ["approved", "executed", "rejected"],
        limit: 50,
      });
      setHistoryRequests(res.data || []);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadLiveSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetchSupportSessions({ status: "crm_live" });
      setLiveSessions(res.data || []);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChangeRequests();
  }, [loadChangeRequests]);

  // Deep-link: restore the selected item from ?id= param on initial mount.
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (!idParam) return;

    if (activeTab === "change-requests" || activeTab === "history") {
      openChangeRequest(idParam);
    } else if (activeTab === "live-chat") {
      fetchSupportSession(idParam)
        .then((res) => setSelectedSession(res.data.session))
        .catch(() => {
          /* session may no longer exist */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "live-chat") loadLiveSessions();
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadLiveSessions, loadHistory]);

  // ── Socket: real-time updates ─────────────────────────────────────────────────
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const s = io(apiBase, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on(
      "crm:change-request-updated",
      ({ changeRequestId }: { changeRequestId: string }) => {
        // Remove from the pending list
        setChangeRequests((prev) =>
          prev.filter((cr) => cr._id !== changeRequestId),
        );

        // If the handled CR is currently open in the panel, re-fetch it so the
        // panel shows the updated status (e.g. another agent just approved it)
        if (selectedCRIdRef.current === changeRequestId) {
          fetchChangeRequest(changeRequestId)
            .then((res) => {
              setSelectedCR(res.data.changeRequest);
              setSelectedCRSession(res.data.session);
            })
            .catch(() => {
              setSelectedCR(null);
              setSelectedCRSession(null);
            });
        }

        // Always refresh history so the executed item appears there
        loadHistory();
      },
    );

    s.on("crm:new-change-request", () => {
      loadChangeRequests();
    });

    s.on("crm:new-live-session", () => {
      loadLiveSessions();
    });

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Selection helpers ────────────────────────────────────────────────────────

  async function openChangeRequest(id: string) {
    try {
      const res = await fetchChangeRequest(id);
      setSelectedCR(res.data.changeRequest);
      setSelectedCRSession(res.data.session);
      setSearchParams({ tab: activeTab, id });
    } catch {
      /* ignore */
    }
  }

  async function selectSession(session: SupportChatSession) {
    const res = await fetchSupportSession(session.sessionId);
    setSelectedSession(res.data.session);
    setSearchParams({ tab: "live-chat", id: session.sessionId });
  }

  // ── Panel action callbacks ───────────────────────────────────────────────────

  // Called when THIS agent clicks Approve & Apply.
  // The CR is removed from the pending list; the panel stays open showing "approved"
  // (via local crStatus state in ChangeRequestReviewPanel) and will show "executed"
  // once the socket re-fetch completes after the main backend applies the change.
  function handleCRApproved(crId: string) {
    setChangeRequests((prev) => prev.filter((cr) => cr._id !== crId));
    loadHistory();
  }

  // Called when THIS agent clicks Reject.
  function handleCRRejected() {
    setSelectedCR(null);
    setSelectedCRSession(null);
    loadChangeRequests();
    loadHistory();
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setSelectedCR(null);
    setSelectedSession(null);
    setSearchParams({ tab });
  }

  // ── Derived counts ───────────────────────────────────────────────────────────
  const pendingCount = changeRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const liveCount = liveSessions.length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-slate-950 min-h-screen">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Support Inbox</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Review customer change requests and handle live support sessions
            </p>
          </div>
          <button
            onClick={() => {
              if (activeTab === "change-requests") loadChangeRequests();
              else if (activeTab === "live-chat") loadLiveSessions();
              else loadHistory();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => switchTab("change-requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "change-requests"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Inbox size={14} />
            Change Requests
            {pendingCount > 0 && (
              <span className="ml-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab("live-chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "live-chat"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <MessageSquare size={14} />
            Live Chat
            {liveCount > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {liveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <History size={14} />
            History
          </button>
        </div>
      </div>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left list ─────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-r border-slate-800 overflow-y-auto bg-slate-950">
          {/* Pending change requests */}
          {activeTab === "change-requests" && (
            <>
              {crLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-800 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : changeRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                  <Inbox size={24} className="mb-2 opacity-50" />
                  No pending requests
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {changeRequests.map((cr) => (
                    <button
                      key={cr._id}
                      onClick={() => openChangeRequest(cr._id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors ${
                        selectedCR?._id === cr._id
                          ? "bg-slate-800 border-l-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300 font-medium truncate">
                          {CHANGE_TYPE_LABEL[cr.changeType] || cr.changeType}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[cr.status]}`}
                        >
                          {STATUS_LABEL[cr.status] ?? cr.status}
                        </span>
                      </div>
                      <p className="text-sm text-white font-semibold mt-0.5">
                        {cr.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        SR {cr.serviceRequestRef}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {new Date(cr.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Live sessions */}
          {activeTab === "live-chat" && (
            <>
              {sessionsLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-800 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : liveSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                  <MessageSquare size={24} className="mb-2 opacity-50" />
                  No active live chats
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {liveSessions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => selectSession(s)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors ${
                        selectedSession?.sessionId === s.sessionId
                          ? "bg-slate-800 border-l-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">
                          {s.customerName}
                        </p>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </div>
                      {s.customerPhone && (
                        <p className="text-xs text-slate-500">
                          {s.customerPhone}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1">
                        {new Date(s.updatedAt).toLocaleString()}
                      </p>
                      {!s.assignedCrmAgentId && (
                        <span className="inline-block mt-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                          Unassigned
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* History */}
          {activeTab === "history" && (
            <>
              {historyLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-800 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : historyRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                  <History size={24} className="mb-2 opacity-50" />
                  No handled requests yet
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {historyRequests.map((cr) => (
                    <button
                      key={cr._id}
                      onClick={() => openChangeRequest(cr._id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors ${
                        selectedCR?._id === cr._id
                          ? "bg-slate-800 border-l-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300 font-medium truncate">
                          {CHANGE_TYPE_LABEL[cr.changeType] || cr.changeType}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[cr.status]}`}
                        >
                          {STATUS_LABEL[cr.status] ?? cr.status}
                        </span>
                      </div>
                      <p className="text-sm text-white font-semibold mt-0.5">
                        {cr.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        SR {cr.serviceRequestRef}
                      </p>
                      {cr.reviewedByName && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          by {cr.reviewedByName}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1">
                        {new Date(
                          cr.reviewedAt ?? cr.updatedAt,
                        ).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right detail panel ────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden relative h-full">
          {/* Change requests — empty state */}
          {activeTab === "change-requests" && !selectedCR && (
            <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2">
              <Inbox size={32} className="opacity-30" />
              <p className="text-sm">Select a request to review</p>
            </div>
          )}

          {/* Change request detail (pending tab) */}
          {activeTab === "change-requests" && selectedCR && (
            <ChangeRequestReviewPanel
              key={selectedCR._id}
              changeRequest={selectedCR}
              session={selectedCRSession}
              onApproved={handleCRApproved}
              onRejected={handleCRRejected}
            />
          )}

          {/* Live chat — empty state */}
          {activeTab === "live-chat" && !selectedSession && (
            <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2">
              <MessageSquare size={32} className="opacity-30" />
              <p className="text-sm">Select a session to start chatting</p>
            </div>
          )}

          {activeTab === "live-chat" && selectedSession && (
            <div className="h-full relative">
              <LiveChatPanel
                key={selectedSession.sessionId}
                session={selectedSession}
                onResolved={() => {
                  setSelectedSession(null);
                  loadLiveSessions();
                }}
              />
            </div>
          )}

          {/* History — empty state */}
          {activeTab === "history" && !selectedCR && (
            <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2">
              <History size={32} className="opacity-30" />
              <p className="text-sm">
                Select a request to view its details and audit trail
              </p>
            </div>
          )}

          {/* History detail (read-only — status is never "pending" here) */}
          {activeTab === "history" && selectedCR && (
            <ChangeRequestReviewPanel
              key={selectedCR._id}
              changeRequest={selectedCR}
              session={selectedCRSession}
              onApproved={handleCRApproved}
              onRejected={handleCRRejected}
            />
          )}
        </div>
      </div>
    </div>
  );
}
