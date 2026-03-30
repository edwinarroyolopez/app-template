import type { Purchase, PurchasePaymentType, PurchaseStatus } from '../types/purchase.type';

export type PurchaseInvoice = {
  invoiceKey: string;
  provider: string;
  invoiceDate: string;
  invoiceImageUrl?: string;
  paymentType?: PurchasePaymentType;
  status: PurchaseStatus;
  totalAmount: number;
  paidAmountCop: number;
  remainingAmountCop: number;
  lines: Purchase[];
  lineCount: number;
};

function normalizeDate(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

function toTime(value?: string | number) {
  if (value === undefined || value === null) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

export function buildInvoiceKey(provider: string, invoiceDate: string) {
  return `${provider.trim().toLowerCase()}::${normalizeDate(invoiceDate)}`;
}

export function shortInvoiceId(value?: string, size = 8) {
  const raw = String(value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  if (!raw) return '------';
  return raw.slice(-size);
}

export function groupPurchasesByInvoice(purchases: Purchase[]): PurchaseInvoice[] {
  const map = new Map<string, PurchaseInvoice>();

  for (const purchase of purchases) {
    const key =
      purchase.invoiceGroupId ||
      buildInvoiceKey(purchase.provider || '', purchase.invoiceDate || '') ||
      purchase._id ||
      purchase.id ||
      `invoice-${normalizeDate(purchase.invoiceDate)}`;
    const current = map.get(key);

    if (!current) {
      const initialPaid = Math.max(0, Number(purchase.paidAmountCop || 0));
      const initialTotal = Number(purchase.totalAmount || 0);
      const isContado = purchase.paymentType === 'CONTADO';
      const normalizedPaid = isContado ? initialTotal : initialPaid;
      const initialRemaining = isContado ? 0 : Math.max(initialTotal - normalizedPaid, 0);
      map.set(key, {
        invoiceKey: key,
        provider: purchase.provider,
        invoiceDate: purchase.invoiceDate,
        invoiceImageUrl: purchase.invoiceImageUrl,
        paymentType: purchase.paymentType,
        status: initialRemaining <= 0 ? 'PAGADA' : purchase.status === 'VENCIDA' ? 'VENCIDA' : 'PENDIENTE',
        totalAmount: initialTotal,
        paidAmountCop: normalizedPaid,
        remainingAmountCop: initialRemaining,
        lines: [purchase],
        lineCount: 1,
      });
      continue;
    }

    current.lines.push(purchase);
    current.lineCount += 1;
    current.totalAmount += purchase.totalAmount || 0;
    if (!current.invoiceImageUrl && purchase.invoiceImageUrl) {
      current.invoiceImageUrl = purchase.invoiceImageUrl;
    }
    if (!current.paymentType && purchase.paymentType) {
      current.paymentType = purchase.paymentType;
    }
    if (current.paymentType === 'CONTADO') {
      current.paidAmountCop = current.totalAmount;
      current.remainingAmountCop = 0;
      current.status = 'PAGADA';
      continue;
    }

    current.paidAmountCop = Math.max(current.paidAmountCop, Number(purchase.paidAmountCop || 0));
    current.remainingAmountCop = Math.max(current.totalAmount - current.paidAmountCop, 0);

    if (current.remainingAmountCop <= 0) current.status = 'PAGADA';
    else if (purchase.status === 'VENCIDA') current.status = 'VENCIDA';
    else current.status = 'PENDIENTE';
  }

  return Array.from(map.values()).sort((a, b) => {
    const aRecentLine = Math.max(...a.lines.map((line) => toTime(line.createdAt || line.invoiceDate)), 0);
    const bRecentLine = Math.max(...b.lines.map((line) => toTime(line.createdAt || line.invoiceDate)), 0);
    if (bRecentLine !== aRecentLine) return bRecentLine - aRecentLine;
    return toTime(b.invoiceDate) - toTime(a.invoiceDate);
  });
}
