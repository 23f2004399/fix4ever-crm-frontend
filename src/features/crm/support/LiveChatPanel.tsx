import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import {
  sendCrmMessage,
  resolveSupportSession,
  assignSupportSession,
} from "./api";
import type { SupportChatSession, SupportMessage } from "./types";

interface Props {
  session: SupportChatSession;
  onResolved: () => void;
}

export function LiveChatPanel({ session, onResolved }: Props) {
  const [messages, setMessages] = useState<SupportMessage[]>(session.messages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [joined, setJoined] = useState(!!session.assignedCrmAgentId);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, customerTyping]);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const s = io(apiBase, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = s;

    // Join the support session room on the main backend is handled via REST (assign).
    // The main backend emits to `support-${sessionId}` room which the customer is in.
    // CRM agents listen to their own socket for events piped here via CRM backend.

    s.on(
      "crm:customer-message",
      ({
        sessionId,
        message,
      }: {
        sessionId: string;
        message: SupportMessage;
      }) => {
        if (sessionId === session.sessionId) {
          setCustomerTyping(false);
          setMessages((prev) => [...prev, message]);
        }
      },
    );

    s.on("crm:customer-typing", ({ sessionId }: { sessionId: string }) => {
      if (sessionId === session.sessionId) {
        setCustomerTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setCustomerTyping(false), 3000);
      }
    });

    return () => {
      s.disconnect();
    };
  }, [session.sessionId]);

  async function handleJoin() {
    await assignSupportSession(session.sessionId);
    setJoined(true);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendCrmMessage(session.sessionId, content);
      // Optimistic message
      setMessages((prev) => [
        ...prev,
        {
          id: `opt_${Date.now()}`,
          senderRole: "crm_agent",
          senderName: "You",
          content,
          messageType: "text",
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    setResolving(true);
    try {
      await resolveSupportSession(session.sessionId, resolveNote || undefined);
      setShowResolveModal(false);
      onResolved();
    } finally {
      setResolving(false);
    }
  }

  const roleBubble: Record<string, string> = {
    customer: "bg-slate-700 text-slate-100",
    crm_agent: "bg-blue-600 text-white",
    bot: "bg-slate-800 text-slate-300",
    system: "",
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div>
          <p className="text-sm font-semibold text-white">
            {session.customerName}
          </p>
          {session.customerPhone && (
            <p className="text-xs text-slate-400">{session.customerPhone}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!joined ? (
            <button
              onClick={handleJoin}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Join Chat
            </button>
          ) : (
            <button
              onClick={() => setShowResolveModal(true)}
              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1"
            >
              <CheckCircle size={12} />
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {messages.map((m) => {
          const isSystem =
            m.senderRole === "system" ||
            m.messageType === "system" ||
            m.messageType === "resolution";
          if (isSystem) {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                  {m.content}
                </span>
              </div>
            );
          }
          const isAgent = m.senderRole === "crm_agent";
          return (
            <div
              key={m.id}
              className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${roleBubble[m.senderRole] || "bg-slate-700 text-slate-200"} ${isAgent ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              >
                {!isAgent && m.senderName && (
                  <p className="text-[10px] text-slate-400 mb-0.5">
                    {m.senderName}
                  </p>
                )}
                {m.content}
              </div>
            </div>
          );
        })}
        {customerTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {joined && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-700 bg-slate-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      )}

      {/* Resolve modal */}
      {showResolveModal && (
        <div className="absolute inset-0 bg-black/60 flex items-end justify-center z-10 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 w-full max-w-sm border border-slate-700">
            <p className="text-sm font-semibold text-white mb-3">
              Resolve this session
            </p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Optional: add a resolution note for the customer…"
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 text-sm py-2 border border-slate-600 rounded-xl text-slate-400 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="flex-1 text-sm py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {resolving ? "Resolving…" : "Confirm Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
