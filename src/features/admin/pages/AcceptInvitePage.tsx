/**
 * Accept Invite Page
 *
 * Public page shown when user opens an invite link. Loads invite details by token,
 * then lets them set password and name to create an account or merge roles.
 * Redirects to dashboard/admin after success.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getInvitationByToken, acceptInvitation } from "../api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getErrorMessage } from "@/shared/utils/error";
import { ROLE_LABELS, ROLE_COLORS } from "../types";
import type { AssignableRole } from "../types";

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: invitation,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationByToken(token!),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptInvitation(token!, password, username),
    onSuccess: (result) => {
      setAuth(result.user, result.tokens);
      toast.success("Welcome! Your account has been set up.");
      navigate(result.user.role === "admin" ? "/admin" : "/dashboard");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to accept invitation"));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (!username.trim()) return toast.error("Enter your name");
    acceptMutation.mutate();
  }

  const errMsg = error ? getErrorMessage(error) : undefined;

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">
            Invalid invitation link
          </h1>
          <p className="text-slate-500 mb-4">
            This link is invalid or incomplete.
          </p>
          <a
            href="/login"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading invitation…
        </div>
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Invitation invalid or expired
          </h1>
          <p className="text-slate-500 mb-6">
            {errMsg ?? "This invitation may have expired or already been used."}
          </p>
          <a
            href="/login"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%-20%,rgba(59,130,246,0.12),transparent)]" />
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <h1 className="text-2xl xl:text-3xl font-bold text-white tracking-tight">
            You&apos;re invited to Fix4Ever CRM
          </h1>
          <p className="text-slate-400 mt-4 max-w-sm leading-relaxed">
            {invitation.invitedByName} has invited you to join the team with the
            following roles:
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {invitation.roles.map((r: AssignableRole) => (
              <span
                key={r}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${ROLE_COLORS[r]}`}
              >
                {ROLE_LABELS[r]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-950">
        <div className="w-full max-w-[400px] animate-in-slide-up">
          <div className="lg:hidden mb-8">
            <h1 className="text-xl font-bold text-white">Accept invitation</h1>
            <p className="text-slate-500 text-sm mt-1">{invitation.email}</p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8">
            <div className="mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-slate-400 text-sm">Signing up as</p>
              <p className="text-white font-medium truncate">
                {invitation.email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your display name"
                  className="input-field"
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Create password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input-field pr-10"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    title={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={acceptMutation.isPending}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                {acceptMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Accept & create account"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
