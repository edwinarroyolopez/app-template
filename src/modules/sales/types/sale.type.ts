export type Sale = {
  _id: string;
  workspaceId: string;
  amountCop: number;
  date: string;
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | string;
  description?: string;
  clientId?: string;
  productId?: string;
  saleType?: SaleType;
  status?: SaleStatus;
  priority?: SalePriority;
  isDelayed?: boolean;
  delayedDays?: number;
  delayedAt?: string;
  delayReason?: string;
  responsibleEmployeeId?: string;
  responsibleEmployee?: {
    id?: string;
    name?: string;
    lastName?: string;
    phone?: string;
  };
  paymentStatus?: SalePaymentStatus;
  paidAmountCop?: number;
  remainingAmountCop?: number;
  deliveryType?: SaleDeliveryType;
  deliveryDate?: string;
  client?: {
    id?: string;
    name?: string;
    phone?: string;
    address?: string;
  };
  product?: {
    id?: string;
    name?: string;
    details?: string;
    dimensions?: string;
    imageUrl?: string;
  };
  items?: SaleItem[];
  observations?: string;
  invoiceImageUrl?: string;
  paymentProofStatus?: 'NOT_REQUIRED' | 'PENDING' | 'ATTACHED';
  paymentProof?: {
    paymentMethod: string;
    receiptImageUrl: string;
    receiptPublicId?: string;
    uploadedAt?: string;
  };
  saleEvidence?: {
    imageUrl: string;
    publicId?: string;
    uploadedAt?: string;
    label?: string;
  };
  events?: SaleEvent[];
  createdByUserId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manufacturingItems?: ManufacturingItem[];
};

export type SaleItem = {
  itemId?: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalCop?: number;
  requiresManufacturing?: boolean;
  operationalStatus?: SaleStatus;
  readyAt?: string;
  deliveredAt?: string;
};

export type ManufacturingItem = {
  manufacturingItemId: string;
  saleItemId: string;
  productId?: string;
  productName: string;
  quantity: number;
  operationalStatus: SaleStatus;
  priority: SalePriority;
  commitmentDate?: string;
  responsibleEmployeeId?: string;
  responsibleEmployee?: {
    id?: string;
    name?: string;
    lastName?: string;
    phone?: string;
  };
  materialsBlocked?: boolean;
  isDelayed?: boolean;
  delayedDays?: number;
  startedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  notes?: string;
  eventHistory?: SaleEvent[];
};

export type ManufacturingProcess = {
  id: string;
  manufacturingItemId: string;
  saleId: string;
  saleCode: string;
  saleDate?: string;
  saleStatus?: SaleStatus;
  customerName?: string;
  customerPhone?: string;
  saleItemId: string;
  productId?: string;
  productName: string;
  quantity: number;
  operationalStatus: SaleStatus;
  priority: SalePriority;
  commitmentDate?: string;
  responsibleEmployeeId?: string;
  responsibleEmployee?: {
    id?: string;
    name?: string;
    lastName?: string;
    phone?: string;
  };
  materialsBlocked?: boolean;
  isDelayed?: boolean;
  delayedDays?: number;
  startedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  notes?: string;
  eventHistory?: SaleEvent[];
};

export type SaleFlowType = 'IMMEDIATE' | 'SPECIAL_ORDER' | 'MANUFACTURE';
export type SaleDeliveryType = 'IMMEDIATE' | 'MANUFACTURE';
export type SaleType = 'IMMEDIATE' | 'SPECIAL_ORDER' | 'MANUFACTURE';
export type SalePriority = 'NORMAL' | 'HIGH' | 'URGENT';
export type SalePaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export type SaleStatus =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'EN_FABRICACION'
  | 'LISTO_PARA_ENTREGAR'
  | 'EN_REPARTO'
  | 'ENTREGADA'
  | 'CANCELADA';

export type SaleEvent = {
  type: string;
  message: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  statusSnapshot?: SaleStatus;
  statusLabel?: string;
  statusColor?: string;
  photos?: Array<{
    url: string;
    thumbnailUrl?: string;
    publicId?: string;
  }>;
  metadata?: Record<string, any>;
};

export type SaleDetails = {
  flowType: SaleFlowType;
  priority?: SalePriority;
  deliveryDate?: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  productName?: string;
  productId?: string;
  productDetails?: string;
  dimensions?: string;
  productImageUrl?: string;
  observations?: string;
};
