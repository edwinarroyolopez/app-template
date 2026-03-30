import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import { addLocalSale } from '@/storage/sales.local';
import { generateObjectId } from '@/utils/generateId';
import type {
  SaleStatus,
  SaleDeliveryType,
  SaleEvent,
  SaleType,
  SalePriority,
  SalePaymentStatus,
} from '../types/sale.type';

export function useCreateSale() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();
  const isOnline = useIsOnline();

  return useMutation({
    mutationFn: async (payload: {
      amountCop: number;
      date: string;
      paymentMethod: string;
      description?: string;
      saleType?: SaleType;
      status?: SaleStatus;
      priority?: SalePriority;
      paymentStatus?: SalePaymentStatus;
      paidAmountCop?: number;
      remainingAmountCop?: number;
      initialPaidAmountCop?: number;
      deliveryType?: SaleDeliveryType;
      deliveryDate?: string;
      clientId?: string;
      productId?: string;
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
      observations?: string;
      paymentProof?: {
        paymentMethod: string;
        receiptImageUrl: string;
        receiptPublicId?: string;
      };
      saleEvidence?: {
        imageUrl: string;
        publicId?: string;
        label?: string;
      };
      events?: SaleEvent[];
      items?: Array<{
        productId?: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        requiresManufacturing?: boolean;
      }>;
    }) => {
      const normalizedPaymentMethod = String(payload.paymentMethod || '').toUpperCase();

      const uploadImage = async (uri: string, filePrefix: string) => {
        const extMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        const ext = extMatch?.[1]?.toLowerCase();
        const mimeByExt: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
          heic: 'image/heic',
        };

        const form = new FormData();
        form.append('file', {
          uri,
          name: `${filePrefix}-${Date.now()}.${ext || 'jpg'}`,
          type: mimeByExt[ext || ''] || 'image/jpeg',
        } as any);

        const { data } = await api.post('/uploads', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return {
          receiptImageUrl: String(data?.original || ''),
          receiptPublicId: data?.id ? String(data.id) : undefined,
        };
      };

      if (!isOnline || !workspaceId) {
        addLocalSale({
          id: generateObjectId(),
          workspaceId: workspaceId!,
          amountCop: payload.amountCop,
          date: payload.date,
          paymentMethod: payload.paymentMethod,
          description: payload.description,
          saleType: payload.saleType,
          status: payload.status,
          priority: payload.priority,
          paymentStatus: payload.paymentStatus,
          paidAmountCop: payload.paidAmountCop,
          remainingAmountCop: payload.remainingAmountCop,
          initialPaidAmountCop: payload.initialPaidAmountCop,
          deliveryType: payload.deliveryType,
          deliveryDate: payload.deliveryDate,
          clientId: payload.clientId || payload.client?.id,
          productId: payload.productId || payload.product?.id,
          client: payload.client,
          product: payload.product,
          items: payload.items,
          observations: payload.observations,
          invoiceImageUrl: payload.saleEvidence?.imageUrl,
          paymentProof: payload.paymentProof,
          saleEvidence: payload.saleEvidence,
          events: payload.events,
          syncStatus: 'LOCAL',
          createdAt: Date.now(),
        });

        return { offline: true };
      }

      let resolvedPaymentProof = payload.paymentProof;
      let resolvedSaleEvidence = payload.saleEvidence;

      const isLocalUri = (uri?: string) => !!uri && !/^https?:\/\//i.test(uri);

      if (isLocalUri(payload.paymentProof?.receiptImageUrl)) {
        const paymentProof = payload.paymentProof;
        if (paymentProof?.receiptImageUrl) {
          const uploaded = await uploadImage(paymentProof.receiptImageUrl, 'sale-payment-proof');
          if (uploaded.receiptImageUrl) {
            resolvedPaymentProof = {
              paymentMethod: paymentProof.paymentMethod,
              receiptImageUrl: uploaded.receiptImageUrl,
              receiptPublicId: uploaded.receiptPublicId,
            };
          }
        }
      }

      if (isLocalUri(payload.saleEvidence?.imageUrl)) {
        const saleEvidence = payload.saleEvidence;
        if (saleEvidence?.imageUrl) {
          const uploaded = await uploadImage(saleEvidence.imageUrl, 'sale-evidence');
          if (uploaded.receiptImageUrl) {
            resolvedSaleEvidence = {
              imageUrl: uploaded.receiptImageUrl,
              publicId: uploaded.receiptPublicId,
              label: saleEvidence.label,
            };
          }
        }
      }

      const { data } = await api.post(`/workspaces/${workspaceId}/sales`, {
        amountCop: payload.amountCop,
        date: payload.date,
        paymentMethod: payload.paymentMethod,
        description: payload.description,
        saleType: payload.saleType,
        status: payload.status,
        priority: payload.priority,
        initialPaidAmountCop: payload.initialPaidAmountCop,
        deliveryType: payload.deliveryType,
        deliveryDate: payload.deliveryDate,
        clientId: payload.clientId || payload.client?.id,
        clientName: payload.client?.name,
        clientPhone: payload.client?.phone,
        clientAddress: payload.client?.address,
        productId: payload.productId || payload.product?.id,
        productName: payload.product?.name,
        productDetails: payload.product?.details,
        dimensions: payload.product?.dimensions,
        productImageUrl: payload.product?.imageUrl,
        observations: payload.observations,
        invoiceImageUrl: resolvedSaleEvidence?.imageUrl,
        paymentProof: resolvedPaymentProof,
        saleEvidence: resolvedSaleEvidence,
        items: payload.items,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
    },
  });
}
