import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getLocalSales } from '@/storage/sales.local';

export function useSaleDetail(saleId?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['sale-detail', workspaceId, saleId],
    enabled: !!workspaceId && !!saleId,
    queryFn: async () => {
      if (!workspaceId || !saleId) return null;

      try {
        const { data } = await api.get(`/workspaces/${workspaceId}/sales/${saleId}`);
        return data;
      } catch {
        const local = getLocalSales().find((item) => item.workspaceId === workspaceId && item.id === saleId);
        return local || null;
      }
    },
  });
}
