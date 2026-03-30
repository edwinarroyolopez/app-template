import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { inventoryApi } from '../services/inventory.api';

export function useInventoryLiquidationDetail(auditId?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['inventory', 'liquidation-detail', workspaceId, auditId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return null;

      if (!auditId) {
        const last = await inventoryApi.getLastLiquidation(workspaceId);
        if (!last?._id) return null;
        return inventoryApi.getLiquidationDetail(workspaceId, last._id);
      }

      return inventoryApi.getLiquidationDetail(workspaceId, auditId);
    },
  });
}
