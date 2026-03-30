import { storage } from './mmkv';

export type LocalSale = {
  id: string;
  workspaceId: string;
  amountCop: number;
  date: string;
  paymentMethod: string;
  description?: string;
  clientId?: string;
  productId?: string;
  saleType?: 'IMMEDIATE' | 'SPECIAL_ORDER' | 'MANUFACTURE';
  status?:
    | 'PENDIENTE'
    | 'EN_PROCESO'
    | 'EN_FABRICACION'
    | 'LISTO_PARA_ENTREGAR'
    | 'EN_REPARTO'
    | 'ENTREGADA'
    | 'CANCELADA';
  deliveryType?: 'IMMEDIATE' | 'MANUFACTURE';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
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
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID';
  paidAmountCop?: number;
  remainingAmountCop?: number;
  initialPaidAmountCop?: number;
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
  items?: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotalCop?: number;
    requiresManufacturing?: boolean;
    operationalStatus?:
      | 'PENDIENTE'
      | 'EN_PROCESO'
      | 'EN_FABRICACION'
      | 'LISTO_PARA_ENTREGAR'
      | 'EN_REPARTO'
      | 'ENTREGADA'
      | 'CANCELADA';
  }>;
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
  events?: Array<{
    type: string;
    message: string;
    createdAt: string;
    createdBy?: string;
    createdByName?: string;
    statusSnapshot?:
      | 'PENDIENTE'
      | 'EN_PROCESO'
      | 'EN_FABRICACION'
      | 'LISTO_PARA_ENTREGAR'
      | 'EN_REPARTO'
      | 'ENTREGADA'
      | 'CANCELADA';
    statusLabel?: string;
    statusColor?: string;
    photos?: Array<{
      url: string;
      thumbnailUrl?: string;
      publicId?: string;
    }>;
    metadata?: Record<string, any>;
  }>;
  syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt: number;
};

const KEY = 'sales-local';

export function getLocalSales(): LocalSale[] {
  const raw = storage.getString(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveLocalSales(sales: LocalSale[]) {
  storage.set(KEY, JSON.stringify(sales));
}

export function addLocalSale(sale: LocalSale) {
  const current = getLocalSales();
  saveLocalSales([sale, ...current]);
}

export function updateLocalSale(id: string, patch: Partial<LocalSale>) {
  const current = getLocalSales();
  saveLocalSales(current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
}

export function saveRemoteSalesToLocal(remoteSales: any[]) {
  const local = getLocalSales();
  const localMap = new Map(local.map((l) => [l.id, l]));

  remoteSales.forEach((remote) => {
    localMap.set(remote._id, {
      id: remote._id,
      workspaceId: remote.workspaceId,
      amountCop: remote.amountCop,
      date: remote.date,
      paymentMethod: remote.paymentMethod,
      description: remote.description,
      clientId: remote.clientId || remote.client?.id,
      productId: remote.productId || remote.product?.id,
      saleType: remote.saleType,
      status: remote.status,
          deliveryType: remote.deliveryType,
          priority: remote.priority,
          isDelayed: remote.isDelayed,
          delayedDays: remote.delayedDays,
          delayedAt: remote.delayedAt,
          delayReason: remote.delayReason,
          responsibleEmployeeId: remote.responsibleEmployeeId,
          responsibleEmployee: remote.responsibleEmployee,
          paymentStatus: remote.paymentStatus,
      paidAmountCop: remote.paidAmountCop,
      remainingAmountCop: remote.remainingAmountCop,
      initialPaidAmountCop: remote.paidAmountCop,
      deliveryDate: remote.deliveryDate,
      client: remote.client,
      product: remote.product,
      items: remote.items,
      observations: remote.observations,
      invoiceImageUrl: remote.invoiceImageUrl,
      paymentProofStatus: remote.paymentProofStatus,
      paymentProof: remote.paymentProof,
      saleEvidence: remote.saleEvidence,
      events: remote.events,
      syncStatus: 'SYNCED',
      createdAt: remote.createdAt ? new Date(remote.createdAt).getTime() : Date.now(),
    });
  });

  saveLocalSales(Array.from(localMap.values()));
}
