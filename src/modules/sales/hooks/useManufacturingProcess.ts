import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import type { ManufacturingProcess, SaleStatus } from '../types/sale.type';

export function useManufacturingProcessDetail(processId?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['manufacturing-process-detail', workspaceId, processId],
    enabled: !!workspaceId && !!processId,
    queryFn: async () => {
      if (!workspaceId || !processId) return null;
      const { data } = await api.get(`/workspaces/${workspaceId}/sales/manufacturing-items/${processId}`);
      return data as {
        process: ManufacturingProcess;
        sale: any;
      };
    },
  });
}

export function useUpdateManufacturingProcess() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processId,
      payload,
    }: {
      processId: string;
      payload: {
        operationalStatus?: SaleStatus;
        responsibleEmployeeId?: string;
        priority?: 'NORMAL' | 'HIGH' | 'URGENT';
        commitmentDate?: string;
        materialsBlocked?: boolean;
        notes?: string;
        eventMessage?: string;
        rollbackReason?: string;
      };
    }) => {
      const { data } = await api.put(`/workspaces/${workspaceId}/sales/manufacturing-items/${processId}`, payload);
      return data as ManufacturingProcess;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['factory-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['ready-for-delivery-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['manufacturing-process-detail', workspaceId, result?.manufacturingItemId] });
      if (result?.saleId) {
        qc.invalidateQueries({ queryKey: ['sale-detail', workspaceId, result.saleId] });
      }
    },
  });
}

export function useAddManufacturingProcessEvent() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processId,
      payload,
    }: {
      processId: string;
      payload: {
        type:
          | 'MANUFACTURE_STARTED'
          | 'STRUCTURE_ASSEMBLED'
          | 'MATERIAL_DELAY'
          | 'ASSEMBLY_COMPLETED'
          | 'READY_FOR_DISPATCH'
          | 'LOADED_FOR_DELIVERY'
          | 'OUT_FOR_DELIVERY'
          | 'CUSTOMER_NOT_AVAILABLE'
          | 'DELIVERY_CONFIRMED'
          | 'DELIVERY_EVIDENCE'
          | 'MATERIALS_UNMANAGED_BLOCK'
          | 'MATERIALS_MANAGED_RESUME'
          | 'MANUAL_NOTE';
        message: string;
        images?: Array<{ uri: string; name?: string; type?: string }>;
        metadata?: Record<string, any>;
      };
    }) => {
      if (payload.images?.length) {
        const form = new FormData();
        form.append('type', payload.type);
        form.append('message', payload.message);
        if (payload.metadata) form.append('metadata', JSON.stringify(payload.metadata));

        payload.images.slice(0, 3).forEach((image, index) => {
          form.append('images', {
            uri: image.uri,
            name: image.name || `manufacturing-${index + 1}.jpg`,
            type: image.type || 'image/jpeg',
          } as any);
        });

        const { data } = await api.post(`/workspaces/${workspaceId}/sales/manufacturing-items/${processId}/events`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data as ManufacturingProcess;
      }

      const { data } = await api.post(`/workspaces/${workspaceId}/sales/manufacturing-items/${processId}/events`, {
        type: payload.type,
        message: payload.message,
        metadata: payload.metadata,
      });
      return data as ManufacturingProcess;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['factory-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['ready-for-delivery-orders', workspaceId] });
      qc.invalidateQueries({ queryKey: ['manufacturing-process-detail', workspaceId, result?.manufacturingItemId] });
      if (result?.saleId) {
        qc.invalidateQueries({ queryKey: ['sale-detail', workspaceId, result.saleId] });
      }
    },
  });
}
