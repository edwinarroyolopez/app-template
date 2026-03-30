export type PurchaseStatus = 'PAGADA' | 'PENDIENTE' | 'VENCIDA';
export type PurchasePaymentType = 'CONTADO' | 'CREDITO';

export type PurchaseEvent = {
  type: string;
  message: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  photos?: Array<{
    url: string;
    thumbnailUrl?: string;
    publicId?: string;
  }>;
  metadata?: Record<string, any>;
};

export type Purchase = {
  _id?: string;
  id?: string;
  workspaceId: string;
  provider: string;
  providerPhone?: string;
  providerId?: string;
  productId: string | { _id: string; name: string; salePrice?: number; purchasePrice?: number };
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  invoiceDate: string;
  invoiceGroupId?: string;
  invoiceImageUrl?: string;
  status: PurchaseStatus;
  paymentType?: PurchasePaymentType;
  paidAmountCop?: number;
  remainingAmountCop?: number;
  events?: PurchaseEvent[];
  createdAt?: string | number;
  updatedAt?: string | number;
};
