/**
 * Invite User Modal
 *
 * Admin modal to create invitations. Collects email + roles, shows invite link
 * on success, and copies it to clipboard. Closes on backdrop click or Escape.
 */
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createInvitation } from "../api";
import { getErrorMessage } from "@/shared/utils/error";
import type { AssignableRole } from "../types";
import { ASSIGNABLE_ROLES, ROLE_LABELS, ROLE_COLORS } from "../types";

interface InviteUserModalProps {
  onClose: () => void;
}

export function InviteUserModal({ onClose }: InviteUserModalProps) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AssignableRole[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createInvitation,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      setCopiedLink(data.inviteLink);
      toast.success("Invitation created");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to create invitation"));
    },
  });

  /** Close modal on Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function toggleRole(role: AssignableRole) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter an email address");
    if (selectedRoles.length === 0)
      return toast.error("Select at least one role");
    mutation.mutate({ email: email.trim(), roles: selectedRoles });
  }

  async function copyLink() {
    if (!copiedLink) return;
    try {
      await navigator.clipboard.writeText(copiedLink);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }

  const isLoading = mutation.isPending;
  const showSuccess = mutation.isSuccess && copiedLink;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in-fade"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl w-full max-w-md overflow-hidden animate-in-slide-up"
        role="dialog"
        aria-labelledby="invite-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/80">
          <h2 id="invite-title" className="text-lg font-semibold text-white">
            Invite user
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Roles to assign
                </label>
                <div className="space-y-2">
                  {ASSIGNABLE_ROLES.map((role) => {
                    const isChecked = selectedRoles.includes(role);
                    return (
                      <label
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-500/10 border-blue-500/40"
                            : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 ${
                            isChecked
                              ? "bg-blue-600 border-blue-600"
                              : "bg-transparent border-slate-500"
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
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
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium px-2.5 py-1 rounded-lg border ${ROLE_COLORS[role]}`}
                        >
                          {ROLE_LABELS[role]}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Select at least one role
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {isLoading ? "Creating…" : "Create invitation"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <p className="text-emerald-400 font-medium">
                  Invitation created
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Share the link below with{" "}
                  <span className="text-white font-medium">{email}</span>. It
                  expires in 7 days.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={copiedLink!}
                  className="input-field flex-1 text-xs font-mono truncate"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium whitespace-nowrap"
                >
                  Copy link
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
