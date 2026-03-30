import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getLocalSales, saveRemoteSalesToLocal } from '@/storage/sales.local';
import { deriveDelayedInfo } from '../utils/delayedSales';

export function useDelayedSales() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['delayed-sales', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];

      let remote: any[] = [];
      let remoteLoaded = false;
      try {
        const res = await api.get(`/workspaces/${workspaceId}/sales/delayed/list`);
        remote = res.data;
        remoteLoaded = true;

        if (remote.length > 0) {
          saveRemoteSalesToLocal(remote);
        }
      } catch {
      }

      const allLocal = getLocalSales().filter((sale) => sale.workspaceId === workspaceId);
      const delayed = allLocal
        .map((sale) => {
          const derived = deriveDelayedInfo(sale as any);
          return {
            ...sale,
            isDelayed: sale.isDelayed ?? derived.isDelayed,
            delayedDays: sale.delayedDays ?? derived.delayedDays,
          };
        })
        .filter((sale) => sale.isDelayed)
        .sort((a, b) => {
          const dayDiff = Number(b.delayedDays || 0) - Number(a.delayedDays || 0);
          if (dayDiff !== 0) return dayDiff;
          return new Date(a.deliveryDate || a.date).getTime() - new Date(b.deliveryDate || b.date).getTime();
        });

      return remoteLoaded ? remote : delayed;
    },
  });
}
