import { storage } from './mmkv';

export type LocalPurchase = {
  id: string;
  workspaceId: string;
  provider: string;
  providerPhone?: string;
  providerId?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  invoiceDate: string;
  invoiceGroupId?: string;
  invoiceImageUrl?: string;
  status: 'PAGADA' | 'PENDIENTE' | 'VENCIDA';
  paymentType?: 'CONTADO' | 'CREDITO';
  paidAmountCop?: number;
  remainingAmountCop?: number;
  events?: Array<{
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
  }>;
  syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt: number;
};

const KEY = 'purchases-local';

export function getLocalPurchases(): LocalPurchase[] {
  const raw = storage.getString(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveLocalPurchases(items: LocalPurchase[]) {
  storage.set(KEY, JSON.stringify(items));
}

export function addLocalPurchase(item: LocalPurchase) {
  const current = getLocalPurchases();
  saveLocalPurchases([item, ...current]);
}

export function updateLocalPurchase(id: string, patch: Partial<LocalPurchase>) {
  const current = getLocalPurchases();
  saveLocalPurchases(current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

export function saveRemotePurchasesToLocal(remotePurchases: any[]) {
  const local = getLocalPurchases();
  const map = new Map(local.map((item) => [item.id, item]));

  remotePurchases.forEach((remote) => {
    map.set(remote._id, {
      id: remote._id,
      workspaceId: remote.workspaceId,
      provider: remote.provider,
      providerPhone: remote.providerPhone,
      providerId: remote.providerId,
      productId: remote.productId?._id || remote.productId,
      productName: remote.productId?.name,
      quantity: remote.quantity,
      unitPrice: remote.unitPrice,
      totalAmount: remote.totalAmount,
      invoiceDate: remote.invoiceDate,
      invoiceGroupId: remote.invoiceGroupId,
      invoiceImageUrl: remote.invoiceImageUrl,
      status: remote.status,
      paymentType: remote.paymentType,
      paidAmountCop: remote.paidAmountCop,
      remainingAmountCop: remote.remainingAmountCop,
      events: remote.events,
      syncStatus: 'SYNCED',
      createdAt: remote.createdAt ? new Date(remote.createdAt).getTime() : Date.now(),
    });
  });

  saveLocalPurchases(Array.from(map.values()));
}
