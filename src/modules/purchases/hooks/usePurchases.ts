import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getLocalPurchases, saveRemotePurchasesToLocal } from '@/storage/purchases.local';
import { purchasesApi } from '../services/purchases.api';

export type PurchasesPeriod = 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL';

function periodRange(period: PurchasesPeriod) {
  if (period === 'ALL') return null;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekDay = today.getUTCDay();
  const mondayOffset = weekDay === 0 ? -6 : 1 - weekDay;

  if (period === 'THIS_WEEK') {
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() + mondayOffset);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'LAST_WEEK') {
    const thisWeekStart = new Date(today);
    thisWeekStart.setUTCDate(thisWeekStart.getUTCDate() + mondayOffset);
    const start = new Date(thisWeekStart);
    start.setUTCDate(start.getUTCDate() - 7);
    const end = new Date(thisWeekStart);
    end.setUTCDate(end.getUTCDate() - 1);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'THIS_MONTH') {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0, 0));
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return { start, end };
  }

  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0, 23, 59, 59, 999));
  return { start, end };
}

function applyLocalFilters(
  items: any[],
  filters: { period: PurchasesPeriod; status: 'ALL' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA'; q?: string },
) {
  let next = [...items];

  if (filters.status !== 'ALL') {
    next = next.filter((item) => item.status === filters.status);
  }

  const range = periodRange(filters.period);
  if (range) {
    next = next.filter((item) => {
      const time = new Date(item.invoiceDate).getTime();
      return time >= range.start.getTime() && time <= range.end.getTime();
    });
  }

  if (filters.q?.trim()) {
    const term = filters.q.trim().toLowerCase();
    const digits = term.replace(/\D/g, '');
    next = next.filter((item) => {
      const provider = String(item.provider || '').toLowerCase();
      const providerPhone = String(item.providerPhone || '').toLowerCase();
      const normalizedPhone = providerPhone.replace(/\D/g, '');

      if (provider.includes(term) || providerPhone.includes(term)) return true;
      return !!digits && normalizedPhone.includes(digits);
    });
  }

  return next.sort((a, b) => {
    const byDate = new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    if (byDate !== 0) return byDate;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export function usePurchases(filters?: {
  period?: PurchasesPeriod;
  status?: 'ALL' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
  q?: string;
}) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const period = filters?.period || 'THIS_WEEK';
  const status = filters?.status || 'ALL';
  const q = filters?.q?.trim() ? filters.q.trim() : undefined;

  return useQuery({
    queryKey: ['purchases', workspaceId, period, status, q || ''],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];

      try {
        const remote = await purchasesApi.listPurchases(workspaceId, {
          period,
          status: status === 'ALL' ? undefined : status,
          q,
        });
        if (remote.length > 0) {
          saveRemotePurchasesToLocal(remote as any[]);
        }

        return remote;
      } catch {
      }

      return applyLocalFilters(
        getLocalPurchases().filter((item) => item.workspaceId === workspaceId),
        { period, status, q },
      );
    },
  });
}
