import { api } from '@/services/api';
import type { Purchase, PurchasePaymentType, PurchaseStatus } from '../types/purchase.type';

export const purchasesApi = {
  async listPurchases(
    workspaceId: string,
    query?: {
      status?: PurchaseStatus;
      period?: 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'ALL';
      q?: string;
    },
  ): Promise<Purchase[]> {
    const { data } = await api.get<Purchase[]>(`/workspaces/${workspaceId}/purchases`, { params: query || {} });
    return data;
  },

  async createPurchase(
    workspaceId: string,
    payload: {
      provider: string;
      providerId?: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      invoiceDate: string;
      invoiceGroupId?: string;
      invoiceImageUrl?: string;
      paymentType?: PurchasePaymentType;
      status?: PurchaseStatus;
    },
  ): Promise<Purchase> {
    const { data } = await api.post<Purchase>(`/workspaces/${workspaceId}/purchases`, payload);
    return data;
  },

  async updatePurchaseStatus(
    workspaceId: string,
    purchaseId: string,
    status: PurchaseStatus,
  ): Promise<Purchase> {
    const { data } = await api.patch<Purchase>(`/workspaces/${workspaceId}/purchases/${purchaseId}/status`, { status });
    return data;
  },

  async updatePurchaseSalePrice(
    workspaceId: string,
    purchaseId: string,
    salePrice: number,
  ): Promise<{
    purchaseId: string;
    productId: string;
    previousSalePrice: number;
    salePrice: number;
    updatedByName: string;
  }> {
    const { data } = await api.patch(`/workspaces/${workspaceId}/purchases/${purchaseId}/sale-price`, {
      salePrice,
    });
    return data;
  },

  async addInvoicePayment(
    workspaceId: string,
    payload: {
      invoiceGroupId?: string;
      provider?: string;
      invoiceDate?: string;
      amountCop: number;
      note?: string;
      images?: Array<{ uri: string; name?: string; type?: string }>;
    },
  ): Promise<{
    invoice: {
      provider: string;
      invoiceDate: string;
      totalAmount: number;
      paidAmountCop: number;
      remainingAmountCop: number;
      status: PurchaseStatus;
    };
  }> {
    if (payload.images?.length) {
      const form = new FormData();
      if (payload.invoiceGroupId) form.append('invoiceGroupId', payload.invoiceGroupId);
      if (payload.provider) form.append('provider', payload.provider);
      if (payload.invoiceDate) form.append('invoiceDate', payload.invoiceDate);
      form.append('amountCop', String(payload.amountCop));
      if (payload.note) form.append('note', payload.note);

      payload.images.slice(0, 1).forEach((image, index) => {
        form.append('images', {
          uri: image.uri,
          name: image.name || `abono-${index + 1}.jpg`,
          type: image.type || 'image/jpeg',
        } as any);
      });

      const { data } = await api.post(`/workspaces/${workspaceId}/purchases/invoices/payments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }

    const { data } = await api.post(`/workspaces/${workspaceId}/purchases/invoices/payments`, payload);
    return data;
  },
};
