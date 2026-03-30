import { useMemo } from 'react';

import { usePurchases } from './usePurchases';
import type { Purchase, PurchaseEvent, PurchaseStatus } from '../types/purchase.type';
import { groupPurchasesByInvoice } from '../utils/purchaseInvoices';

export type PurchaseInvoiceTimelineEvent = {
  type: string;
  message: string;
  createdAt: string | number;
  createdBy?: string;
  createdByName?: string;
  photos?: Array<{
    url: string;
    thumbnailUrl?: string;
    publicId?: string;
  }>;
  metadata?: Record<string, any>;
};

function toNumber(value?: number) {
  return Math.max(0, Number(value || 0));
}

export function usePurchaseInvoiceDetail(invoiceKey: string) {
  const purchasesQuery = usePurchases();

  const invoice = useMemo(() => {
    const purchases = (purchasesQuery.data || []) as Purchase[];
    const grouped = groupPurchasesByInvoice(purchases);
    const found = grouped.find((item) => item.invoiceKey === invoiceKey);
    if (!found) return null;

    const totalAmount = toNumber(found.totalAmount);
    const paymentType = found.lines.find((line) => line.paymentType)?.paymentType || 'CREDITO';
    const paidAmountCop =
      paymentType === 'CONTADO'
        ? totalAmount
        : found.lines.reduce((acc, line) => Math.max(acc, toNumber(line.paidAmountCop)), 0);
    const remainingAmountCop = paymentType === 'CONTADO' ? 0 : Math.max(totalAmount - paidAmountCop, 0);

    let status: PurchaseStatus = 'PENDIENTE';
    if (paymentType === 'CONTADO' || remainingAmountCop <= 0) {
      status = 'PAGADA';
    } else if (found.lines.some((line) => line.status === 'VENCIDA')) {
      status = 'VENCIDA';
    }

    const timelineFromEvents = found.lines
      .flatMap((line) => (line.events || []) as PurchaseEvent[])
      .map((event) => ({
        type: event.type,
        message: event.message,
        createdAt: event.createdAt,
        createdBy: event.createdBy,
        createdByName: event.createdByName,
        photos: event.photos,
        metadata: event.metadata,
      }))
      .filter((event) => !!event.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const hasCreatedEvent = timelineFromEvents.some((event) => event.type === 'INVOICE_CREATED');
    const createdAt = found.lines
      .map((line) => line.createdAt || line.invoiceDate)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] || found.invoiceDate;

    const timelineBase = hasCreatedEvent
      ? timelineFromEvents
      : [
          {
            type: 'INVOICE_CREATED',
            message: `${found.lineCount} productos registrados en esta factura.`,
            createdAt,
          },
          ...timelineFromEvents,
        ];

    const timeline = timelineBase.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      ...found,
      status,
      paymentType,
      paidAmountCop,
      remainingAmountCop,
      timeline,
    };
  }, [purchasesQuery.data, invoiceKey]);

  return {
    invoice,
    isLoading: purchasesQuery.isLoading,
    isFetching: purchasesQuery.isFetching,
    refetch: purchasesQuery.refetch,
  };
}
