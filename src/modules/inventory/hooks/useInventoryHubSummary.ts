import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { inventoryApi } from '../services/inventory.api';

export function useInventoryHubSummary() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  const lastLiquidationQuery = useQuery({
    queryKey: ['inventory', 'last-liquidation', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return null;
      return inventoryApi.getLastLiquidation(workspaceId);
    },
  });

  const activeAuditQuery = useQuery({
    queryKey: ['inventory', 'active-audit', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return null;
      return inventoryApi.getActiveAudit(workspaceId);
    },
  });

  return {
    workspaceId,
    lastLiquidation: lastLiquidationQuery.data,
    activeAudit: activeAuditQuery.data,
    isFetching: lastLiquidationQuery.isFetching || activeAuditQuery.isFetching,
  };
}
