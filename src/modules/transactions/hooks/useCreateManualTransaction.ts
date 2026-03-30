import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { transactionsApi } from '../services/transactions.api';
import type { TransactionKind } from '../types/transaction.type';

export function useCreateManualTransaction() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      kind: TransactionKind;
      amountCop: number;
      date: string;
      category?: string;
      title?: string;
      notes?: string;
      proof?: {
        url: string;
        publicId?: string;
        label?: string;
      };
    }) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return transactionsApi.createManual(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', workspaceId] });
      qc.invalidateQueries({ queryKey: ['transactions-summary', workspaceId] });
    },
  });
}
