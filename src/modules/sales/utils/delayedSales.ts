import type { Sale } from '../types/sale.type';

const CLOSED_STATUSES = new Set(['ENTREGADA', 'CANCELADA']);

export function calculateDelayedDays(deliveryDate?: string, now = new Date()) {
  if (!deliveryDate) return 0;

  const due = new Date(deliveryDate);
  if (Number.isNaN(due.getTime())) return 0;

  const startDue = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const startNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.floor((startNow - startDue) / 86400000);
  return diff > 0 ? diff : 0;
}

export function deriveDelayedInfo(sale: Partial<Sale>, now = new Date()) {
  const closed = CLOSED_STATUSES.has((sale.status || '').toUpperCase());
  const delayedDays = calculateDelayedDays(sale.deliveryDate, now);
  const isDelayed = !closed && delayedDays > 0;

  return {
    isDelayed,
    delayedDays,
  };
}
