export type StockStatus = 'ok' | 'low' | 'critical';

export function getStockStatus(stock?: number, minStock?: number): StockStatus {
  const safeStock = Math.max(0, Math.round(Number(stock || 0)));
  const safeMin = Math.max(0, Math.round(Number(minStock || 0)));

  if (safeStock <= 2) return 'critical';
  if (safeStock <= safeMin) return 'low';
  return 'ok';
}
