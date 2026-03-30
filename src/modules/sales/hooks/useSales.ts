import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { getLocalSales, saveRemoteSalesToLocal } from '@/storage/sales.local';

export type SalesPeriod = 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL';
export type SalesPaymentState = 'ALL' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

function periodRange(period: SalesPeriod) {
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

function applyLocalSalesFilters(
  items: any[],
  period: SalesPeriod,
  paymentState: SalesPaymentState,
  q?: string,
) {
  let next = [...items];

  const range = periodRange(period);
  if (range) {
    next = next.filter((sale) => {
      const time = new Date(sale.date).getTime();
      return time >= range.start.getTime() && time <= range.end.getTime();
    });
  }

  if (paymentState === 'PAGADA') {
    next = next.filter((sale) => sale.paymentStatus === 'PAID');
  } else if (paymentState === 'VENCIDA') {
    next = next.filter(
      (sale) => sale.isDelayed === true && sale.paymentStatus !== 'PAID' && !['ENTREGADA', 'CANCELADA'].includes(sale.status),
    );
  } else if (paymentState === 'PENDIENTE') {
    next = next.filter((sale) => ['PENDING', 'PARTIAL'].includes(sale.paymentStatus) && sale.isDelayed !== true);
  }

  if (q?.trim()) {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, '');
    next = next.filter((sale) => {
      const clientName = String(sale.client?.name || '').toLowerCase();
      const clientPhone = String(sale.client?.phone || '').toLowerCase();
      const normalizedPhone = clientPhone.replace(/\D/g, '');

      if (clientName.includes(term) || clientPhone.includes(term)) return true;
      return !!digits && normalizedPhone.includes(digits);
    });
  }

  return next.sort((a, b) => {
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export function useSales(filters?: {
  period?: SalesPeriod;
  paymentState?: SalesPaymentState;
  q?: string;
}) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const period = filters?.period || 'ALL';
  const paymentState = filters?.paymentState || 'ALL';
  const q = filters?.q?.trim() ? filters.q.trim() : undefined;

  return useQuery({
    queryKey: ['sales', workspaceId, period, paymentState, q || ''],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];

      let remote: any[] = [];
      try {
        const params: any = {};
        if (period !== 'ALL') params.period = period;
        if (paymentState !== 'ALL') params.paymentState = paymentState;
        if (q) params.q = q;

        const res = await api.get(`/workspaces/${workspaceId}/sales`, { params });
        remote = res.data;

        if (remote.length > 0) {
          saveRemoteSalesToLocal(remote);
        }

        return remote;
      } catch {
      }

      const allLocal = getLocalSales().filter((s) => s.workspaceId === workspaceId);
      return applyLocalSalesFilters(allLocal, period, paymentState, q);
    },
  });
}
