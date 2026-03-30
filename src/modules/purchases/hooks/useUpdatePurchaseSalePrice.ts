import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { purchasesApi } from '../services/purchases.api';

export function useUpdatePurchaseSalePrice() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ purchaseId, salePrice }: { purchaseId: string; salePrice: number }) => {
      if (!purchaseId) throw new Error('purchaseId is required');
      if (!workspaceId) throw new Error('workspaceId is required');
      return purchasesApi.updatePurchaseSalePrice(workspaceId, purchaseId, salePrice);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases', workspaceId] });
      qc.invalidateQueries({ queryKey: ['product-events', workspaceId] });
    },
  });
}
