import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { purchasesApi } from '../services/purchases.api';

export function useAddPurchaseInvoicePayment() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      invoiceGroupId?: string;
      provider?: string;
      invoiceDate?: string;
      amountCop: number;
      note?: string;
      images?: Array<{ uri: string; name?: string; type?: string }>;
    }) => {
      if (!workspaceId) throw new Error('workspaceId is required');
      return purchasesApi.addInvoicePayment(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases', workspaceId] });
    },
  });
}
