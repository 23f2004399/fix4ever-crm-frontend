export type ChangeType = "address_update" | "beneficiary_update";
export type ChangeRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "executed";
export type SessionStatus =
  | "bot_flow"
  | "pending_crm_review"
  | "crm_live"
  | "resolved"
  | "rejected"
  | "closed";

export interface AuditEntry {
  action: string;
  performedByName: string;
  performedByRole: string;
  timestamp: string;
  note: string;
}

export interface SupportMessage {
  id: string;
  senderRole: "customer" | "bot" | "crm_agent" | "system";
  senderName?: string;
  content: string;
  messageType: "text" | "quick_reply" | "system" | "resolution" | "rejection";
  timestamp: string;
  read: boolean;
}

export interface SupportChatSession {
  _id: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  status: SessionStatus;
  topic: ChangeType | "crm_live" | null;
  messages: SupportMessage[];
  assignedCrmAgentId?: string;
  crmAgentName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportChangeRequest {
  _id: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  serviceRequestId: string;
  serviceRequestRef: string;
  changeType: ChangeType;
  requestedData: Record<string, unknown>;
  currentData: Record<string, unknown>;
  status: ChangeRequestStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  executedAt?: string;
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}
