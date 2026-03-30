import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCashClosing, getCashClosingDailySummary, listCashClosings } from '../services/cash-closings.api';
import type { CashClosingPeriod } from '../services/cash-closings.api';

export function useCashClosings(workspaceId?: string, period?: CashClosingPeriod) {
  return useQuery({
    queryKey: ['cash-closings', workspaceId, period || 'ALL'],
    queryFn: () => listCashClosings(String(workspaceId), { period }),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateCashClosing(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { totalAmountCop: number; reportedAmountCop?: number; observations?: string; date?: string }) =>
      createCashClosing(String(workspaceId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-closings', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['cash-closings-daily-summary', workspaceId] });
    },
  });
}

export function useCashClosingsDailySummary(workspaceId?: string, date?: string) {
  return useQuery({
    queryKey: ['cash-closings-daily-summary', workspaceId, date || 'today'],
    queryFn: () => getCashClosingDailySummary(String(workspaceId), date),
    enabled: Boolean(workspaceId),
  });
}
