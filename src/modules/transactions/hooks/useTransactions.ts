import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { transactionsApi } from '../services/transactions.api';
import type { TransactionKind, TransactionPeriod } from '../types/transaction.type';

export function useTransactions(filters?: { period?: TransactionPeriod; kind?: TransactionKind | 'ALL' }) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const period = filters?.period || 'THIS_WEEK';
  const kind = filters?.kind || 'ALL';

  return useQuery({
    queryKey: ['transactions', workspaceId, period, kind],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return transactionsApi.list(workspaceId, {
        period,
        kind: kind === 'ALL' ? undefined : kind,
      });
    },
  });
}
