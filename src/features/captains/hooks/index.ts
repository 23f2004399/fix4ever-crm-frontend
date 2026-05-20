import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as captainApi from "../api";

export const captainKeys = {
  stats: () => ["captains", "stats"] as const,
  list: (params?: object) => ["captains", "list", params] as const,
  detail: (id: string) => ["captains", "detail", id] as const,
  wallet: (id: string) => ["captains", id, "wallet"] as const,
  transactions: (id: string, params?: object) =>
    ["captains", id, "transactions", params] as const,
  walletAnalytics: (id: string) =>
    ["captains", id, "wallet-analytics"] as const,
  liveOrders: (id: string) => ["captains", id, "live-orders"] as const,
  history: (id: string, params?: object) =>
    ["captains", id, "history", params] as const,
  settlements: (params?: object) =>
    ["captains", "settlements", params] as const,
};

export function useCaptainStats() {
  return useQuery({
    queryKey: captainKeys.stats(),
    queryFn: captainApi.fetchCaptainStats,
  });
}

export function useCaptains(
  params?: Parameters<typeof captainApi.fetchCaptains>[0],
) {
  return useQuery({
    queryKey: captainKeys.list(params),
    queryFn: () => captainApi.fetchCaptains(params),
  });
}

export function useCaptain(captainId: string) {
  return useQuery({
    queryKey: captainKeys.detail(captainId),
    queryFn: () => captainApi.fetchCaptain(captainId),
    enabled: !!captainId,
  });
}

export function useCaptainWallet(captainId: string) {
  return useQuery({
    queryKey: captainKeys.wallet(captainId),
    queryFn: () => captainApi.fetchCaptainWallet(captainId),
    enabled: !!captainId,
  });
}

export function useCaptainTransactions(
  captainId: string,
  params?: Parameters<typeof captainApi.fetchCaptainTransactions>[1],
) {
  return useQuery({
    queryKey: captainKeys.transactions(captainId, params),
    queryFn: () => captainApi.fetchCaptainTransactions(captainId, params),
    enabled: !!captainId,
  });
}

export function useCaptainWalletAnalytics(captainId: string) {
  return useQuery({
    queryKey: captainKeys.walletAnalytics(captainId),
    queryFn: () => captainApi.fetchCaptainWalletAnalytics(captainId),
    enabled: !!captainId,
  });
}

export function useCaptainLiveOrders(captainId: string) {
  return useQuery({
    queryKey: captainKeys.liveOrders(captainId),
    queryFn: () => captainApi.fetchCaptainLiveOrders(captainId),
    enabled: !!captainId,
    refetchInterval: 30_000,
  });
}

export function useCaptainHistory(
  captainId: string,
  params?: Parameters<typeof captainApi.fetchCaptainHistory>[1],
) {
  return useQuery({
    queryKey: captainKeys.history(captainId, params),
    queryFn: () => captainApi.fetchCaptainHistory(captainId, params),
    enabled: !!captainId,
  });
}

export function useCaptainSettlements(
  params?: Parameters<typeof captainApi.fetchCaptainSettlements>[0],
) {
  return useQuery({
    queryKey: captainKeys.settlements(params),
    queryFn: () => captainApi.fetchCaptainSettlements(params),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateCaptainInfo(captainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      captainApi.updateCaptainInfo(captainId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.detail(captainId) });
      toast.success("Captain info updated");
    },
    onError: () => toast.error("Failed to update captain"),
  });
}

export function useUpdateCaptainDocuments(captainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      captainApi.updateCaptainDocuments(captainId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.detail(captainId) });
      toast.success("Documents updated");
    },
    onError: () => toast.error("Failed to update documents"),
  });
}

export function useApproveCaptain(captainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => captainApi.approveCaptain(captainId, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.detail(captainId) });
      qc.invalidateQueries({ queryKey: captainKeys.stats() });
      qc.invalidateQueries({ queryKey: captainKeys.list() });
      toast.success("Captain approved");
    },
    onError: () => toast.error("Failed to approve captain"),
  });
}

export function useRejectCaptain(captainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => captainApi.rejectCaptain(captainId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.detail(captainId) });
      qc.invalidateQueries({ queryKey: captainKeys.stats() });
      qc.invalidateQueries({ queryKey: captainKeys.list() });
      toast.success("Captain rejected");
    },
    onError: () => toast.error("Failed to reject captain"),
  });
}

export function useSuspendCaptain(captainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      captainApi.suspendCaptain(captainId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.detail(captainId) });
      qc.invalidateQueries({ queryKey: captainKeys.list() });
      toast.success("Captain suspended");
    },
    onError: () => toast.error("Failed to suspend captain"),
  });
}

export function useReactivateCaptain(captainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => captainApi.reactivateCaptain(captainId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.detail(captainId) });
      qc.invalidateQueries({ queryKey: captainKeys.list() });
      toast.success("Captain reactivated");
    },
    onError: () => toast.error("Failed to reactivate captain"),
  });
}

export function useApproveSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: string) =>
      captainApi.approveSettlement(settlementId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.settlements() });
      toast.success("Settlement approved");
    },
    onError: () => toast.error("Failed to approve settlement"),
  });
}

export function useRejectSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      settlementId,
      reason,
    }: {
      settlementId: string;
      reason: string;
    }) => captainApi.rejectSettlement(settlementId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: captainKeys.settlements() });
      toast.success("Settlement rejected");
    },
    onError: () => toast.error("Failed to reject settlement"),
  });
}
