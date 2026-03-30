import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useIsOnline } from '@/hooks/useIsOnline';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { updateLocalPurchase } from '@/storage/purchases.local';
import type { PurchaseStatus } from '../types/purchase.type';
import { purchasesApi } from '../services/purchases.api';

export function useUpdatePurchaseStatus() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const isOnline = useIsOnline();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ purchaseId, status }: { purchaseId: string; status: PurchaseStatus }) => {
      if (!purchaseId) throw new Error('purchaseId is required');

      if (!isOnline || !workspaceId) {
        updateLocalPurchase(purchaseId, { status });
        return { offline: true };
      }

      return purchasesApi.updatePurchaseStatus(workspaceId, purchaseId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases', workspaceId] });
    },
  });
}
