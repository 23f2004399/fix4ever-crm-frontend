import { useCallback, useEffect, useRef, useState } from "react";
import { X, Bell } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: string;
  type:
    | "new_change_request"
    | "new_live_session"
    | "change_request_resubmitted";
  title: string;
  body: string;
  timestamp: Date;
  sessionId?: string;
  changeRequestId?: string;
}

interface NewChangeRequestPayload {
  changeType: string;
  customerName: string;
  serviceRequestRef: string;
  changeRequestId: string;
}

interface NewLiveSessionPayload {
  customerName: string;
  sessionId: string;
}

interface ChangeRequestResubmittedPayload {
  customerName: string;
  changeType: string;
  changeRequestId: string;
}

interface Props {
  onNavigate: (path: string) => void;
}

export function SupportNotificationBanner({ onNavigate }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (data: Omit<Notification, "id" | "timestamp">) => {
      const notifId = `n_${++counterRef.current}`;
      const notif: Notification = {
        ...data,
        id: notifId,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 5));
      setTimeout(() => dismiss(notifId), 8000);
    },
    [dismiss],
  );

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const s = io(apiBase, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = s;

    s.on("crm:new-change-request", (payload: NewChangeRequestPayload) => {
      const label =
        payload.changeType === "address_update"
          ? "Address Update"
          : payload.changeType === "beneficiary_update"
            ? "Beneficiary Update"
            : "Change Request";

      addNotification({
        type: "new_change_request",
        title: `New ${label} Request`,
        body: `${payload.customerName} — SR ${payload.serviceRequestRef}`,
        changeRequestId: payload.changeRequestId,
      });
      setPendingCount((n) => n + 1);
    });

    s.on("crm:new-live-session", (payload: NewLiveSessionPayload) => {
      addNotification({
        type: "new_live_session",
        title: "Customer Requesting Live Support",
        body: `${payload.customerName} needs assistance`,
        sessionId: payload.sessionId,
      });
      setPendingCount((n) => n + 1);
    });

    s.on(
      "crm:change-request-resubmitted",
      (payload: ChangeRequestResubmittedPayload) => {
        addNotification({
          type: "change_request_resubmitted",
          title: "Change Request Resubmitted",
          body: `${payload.customerName} updated their ${payload.changeType?.replace("_", " ")} request`,
          changeRequestId: payload.changeRequestId,
        });
      },
    );

    s.on("crm:change-request-updated", () => {
      setPendingCount((n) => Math.max(0, n - 1));
    });

    return () => {
      s.disconnect();
    };
  }, [addNotification]);

  function handleClick(notif: Notification) {
    dismiss(notif.id);
    if (notif.changeRequestId) {
      onNavigate(
        `/crm/support?tab=change-requests&id=${notif.changeRequestId}`,
      );
    } else if (notif.sessionId) {
      onNavigate(`/crm/support?tab=live-chat&id=${notif.sessionId}`);
    }
  }

  const iconMap = {
    new_change_request: "📋",
    new_live_session: "💬",
    change_request_resubmitted: "🔄",
  };

  return (
    <>
      {/* Notification stack — top right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleClick(notif)}
            className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 cursor-pointer hover:bg-slate-750 transition-colors flex items-start gap-3 animate-in slide-in-from-right"
          >
            <span className="text-xl flex-shrink-0">{iconMap[notif.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{notif.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {notif.body}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(notif.id);
              }}
              className="text-slate-500 hover:text-slate-300"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Persistent badge in nav — rendered here as a floating indicator */}
      {pendingCount > 0 && (
        <div className="fixed bottom-6 left-6 z-40 bg-blue-600 text-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg text-sm font-medium">
          <Bell size={14} />
          {pendingCount} pending support{" "}
          {pendingCount === 1 ? "request" : "requests"}
        </div>
      )}
    </>
  );
}
