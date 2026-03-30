import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import { generateObjectId } from '@/utils/generateId';
import { addLocalFlashAdjustment } from '@/storage/inventory.local';
import { updateLocalProductStock } from '@/storage/products.local';
import { inventoryApi } from '../services/inventory.api';

export function useFlashAdjustInventory() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const isOnline = useIsOnline();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; physicalStock: number; reason?: string }) => {
      const physicalStock = Math.max(0, Math.round(payload.physicalStock));

      if (!workspaceId || !isOnline) {
        addLocalFlashAdjustment({
          id: generateObjectId(),
          workspaceId: workspaceId!,
          productId: payload.productId,
          physicalStock,
          reason: payload.reason,
          syncStatus: 'LOCAL',
          createdAt: Date.now(),
        });

        return { offline: true };
      }

      return inventoryApi.flashAdjust(workspaceId, {
        productId: payload.productId,
        physicalStock,
        reason: payload.reason,
      });
    },
    onSuccess: (_result, variables) => {
      if (!workspaceId) return;

      updateLocalProductStock(workspaceId, variables.productId, variables.physicalStock);

      qc.setQueryData(['products', workspaceId, 'top'], (current: any) => {
        if (!Array.isArray(current)) return current;

        return current.map((item) =>
          item._id === variables.productId
            ? { ...item, stock: Math.max(0, Math.round(variables.physicalStock)) }
            : item,
        );
      });

      qc.invalidateQueries({ queryKey: ['products', workspaceId] });
    },
  });
}
