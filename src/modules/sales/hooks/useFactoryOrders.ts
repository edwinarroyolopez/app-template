import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { deriveDelayedInfo } from '../utils/delayedSales';
import { normalizeSalePriority } from '../utils/saleStatus';
import type { ManufacturingProcess } from '../types/sale.type';

type FactoryOrderLike = {
  delayedDays?: number;
  priority?: string;
  commitmentDate?: string;
  saleDate?: string;
};

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 3,
  HIGH: 2,
  NORMAL: 1,
};

function sortFactoryOrders<T extends FactoryOrderLike>(list: T[]) {
  return [...list].sort((a, b) => {
    const delayedA = Number(a.delayedDays ?? deriveDelayedInfo(a as any).delayedDays ?? 0);
    const delayedB = Number(b.delayedDays ?? deriveDelayedInfo(b as any).delayedDays ?? 0);
    if (delayedA !== delayedB) return delayedB - delayedA;

    const priorityA = PRIORITY_ORDER[normalizeSalePriority(a.priority)] || 0;
    const priorityB = PRIORITY_ORDER[normalizeSalePriority(b.priority)] || 0;
    if (priorityA !== priorityB) return priorityB - priorityA;

    const dateA = new Date(a.commitmentDate || a.saleDate || 0).getTime();
    const dateB = new Date(b.commitmentDate || b.saleDate || 0).getTime();
    return dateA - dateB;
  });
}

export function useFactoryOrders() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['factory-orders', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get(`/workspaces/${workspaceId}/sales/factory/list`);
      const rows = Array.isArray(res.data) ? (res.data as ManufacturingProcess[]) : [];
      return sortFactoryOrders(rows);
    },
  });
}
