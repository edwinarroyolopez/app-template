import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { deriveDelayedInfo } from '../utils/delayedSales';
import type { ManufacturingProcess } from '../types/sale.type';

type DeliveryOrderLike = {
  delayedDays?: number;
  commitmentDate?: string;
  saleDate?: string;
};

function sortDeliveryOrders<T extends DeliveryOrderLike>(list: T[]) {
  return [...list].sort((a, b) => {
    const delayedA = Number(a.delayedDays ?? deriveDelayedInfo(a as any).delayedDays ?? 0);
    const delayedB = Number(b.delayedDays ?? deriveDelayedInfo(b as any).delayedDays ?? 0);
    if (delayedA !== delayedB) return delayedB - delayedA;

    const dateA = new Date(a.commitmentDate || a.saleDate || 0).getTime();
    const dateB = new Date(b.commitmentDate || b.saleDate || 0).getTime();
    return dateA - dateB;
  });
}

export function useReadyForDeliveryOrders() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['ready-for-delivery-orders', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get(`/workspaces/${workspaceId}/sales/ready-for-delivery/list`);
      const rows = Array.isArray(res.data) ? (res.data as ManufacturingProcess[]) : [];
      return sortDeliveryOrders(rows);
    },
  });
}
