import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import type { PaymentMethod } from '@/types/payment-method';
import { garmentWorkshopApi } from '../services/garment-workshop.api';
import type { GarmentLot } from '../types/garment-workshop.types';

export function useGarmentWorkshopSummary(period?: { from?: string; to?: string }) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garment-workshop-summary', workspaceId, period?.from || '', period?.to || ''],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return null;
      return garmentWorkshopApi.getSummary(workspaceId, period);
    },
  });
}

export function useGarmentWorkshopWorkersSummary(period?: {
  from?: string;
  to?: string;
}) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garment-workshop-workers-summary', workspaceId, period?.from || '', period?.to || ''],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return null;
      return garmentWorkshopApi.getWorkersSummary(workspaceId, period);
    },
  });
}

export function useGarmentOperations() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garment-operations', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return garmentWorkshopApi.listOperations(workspaceId);
    },
  });
}

export function useCreateGarmentOperation() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      machineId?: string;
      unitPriceCop: number;
      sequence?: number;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.createOperation(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-operations', workspaceId] });
    },
  });
}

export function useUpdateGarmentOperation() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      operationId: string;
      name?: string;
      machineId?: string;
      unitPriceCop?: number;
      sequence?: number;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      const { operationId, ...body } = payload;
      return garmentWorkshopApi.updateOperation(workspaceId, operationId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-operations', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garments', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
    },
  });
}

export function useDeleteGarmentOperation() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (operationId: string) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.deleteOperation(workspaceId, operationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-operations', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garments', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
    },
  });
}

export function useGarmentMachines() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garment-machines', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return garmentWorkshopApi.listMachines(workspaceId);
    },
  });
}

export function useCreateGarmentMachine() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; code?: string }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.createMachine(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-machines', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-operations', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garments', workspaceId] });
    },
  });
}

export function useGarments() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garments', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return garmentWorkshopApi.listGarments(workspaceId);
    },
  });
}

export function useCreateGarment() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      defaultColor?: string;
      operationIds: string[];
      imageUrls?: string[];
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.createGarment(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
    },
  });
}

export function useUpdateGarment() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      garmentId: string;
      name?: string;
      defaultColor?: string;
      operationIds?: string[];
      imageUrls?: string[];
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      const { garmentId, ...body } = payload;
      return garmentWorkshopApi.updateGarment(workspaceId, garmentId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
    },
  });
}

export function useDeleteGarment() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (garmentId: string) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.deleteGarment(workspaceId, garmentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garments', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
    },
  });
}

export function useGarmentLots(status?: GarmentLot['status']) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garment-lots', workspaceId, status || 'all'],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return garmentWorkshopApi.listLots(workspaceId, status ? { status } : undefined);
    },
  });
}

export function useCreateGarmentLot() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      providerId?: string;
      provider?: {
        name: string;
        phone?: string;
        address?: string;
        rating?: number;
      };
      garmentId: string;
      color?: string;
      colorLines?: Array<{
        color: string;
        sizeDistribution: Array<{ size: string; quantity: number }>;
      }>;
      totalUnits?: number;
      sizeDistribution: Array<{ size: string; quantity: number }>;
      unitAgreedPriceCop?: number;
      receivedDate?: string;
      commitmentDate?: string;
      externalReference?: string;
      baseDocumentEvidenceUrl?: string;
      technicalSheetEvidenceUrl?: string;
      observations?: string;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.createLot(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
    },
  });
}

export function useUpdateGarmentLot(lotId: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      providerId?: string;
      garmentId?: string;
      color?: string;
      colorLines?: Array<{
        color: string;
        sizeDistribution: Array<{ size: string; quantity: number }>;
      }>;
      totalUnits?: number;
      unitAgreedPriceCop?: number;
      receivedDate?: string;
      commitmentDate?: string;
      externalReference?: string;
      baseDocumentUrl?: string;
      technicalSheetUrl?: string;
      observations?: string;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.updateLot(workspaceId, lotId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lot-detail', workspaceId, lotId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
    },
  });
}

export function useAddGarmentLaborPayment(lotId: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      amountCop: number;
      paidAt: string;
      paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
      note?: string;
      evidenceUrl?: string;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.addLaborPayment(workspaceId, lotId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lot-detail', workspaceId, lotId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-workers-summary', workspaceId] });
    },
  });
}

export function useAddGarmentLotIncome(lotId: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      amountCop: number;
      receivedAt: string;
      paymentMethod?: PaymentMethod;
      note?: string;
      evidenceUrl?: string;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.addLotIncome(workspaceId, lotId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lot-detail', workspaceId, lotId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
    },
  });
}

export function useAddGarmentLotCost(lotId: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: 'TRANSPORT' | 'SUPPLY' | 'OTHER';
      supplySubtype?: 'GENERAL' | 'HILO' | 'NYLON';
      amountCop?: number;
      lines?: Array<{
        itemType: string;
        detail?: string;
        quantity?: number;
        totalPaidCop: number;
      }>;
      occurredAt: string;
      note?: string;
      evidenceUrl?: string;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.addLotCost(workspaceId, lotId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lot-detail', workspaceId, lotId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
    },
  });
}

export function useGarmentLotDetail(lotId?: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['garment-lot-detail', workspaceId, lotId || ''],
    enabled: !!workspaceId && !!lotId,
    queryFn: async () => {
      if (!workspaceId || !lotId) return null;
      return garmentWorkshopApi.getLot(workspaceId, lotId);
    },
  });
}

export function useCreateGarmentOperationLog(lotId: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      operationId: string;
      size?: string;
      sizes?: string[];
      color?: string;
      colors?: string[];
      quantity: number;
      workerEmployeeId: string;
      workedAt: string;
      note?: string;
      evidenceUrl?: string;
    }) => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.createLog(workspaceId, lotId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lot-detail', workspaceId, lotId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-workers-summary', workspaceId] });
    },
  });
}

export function useDeliverGarmentLot(lotId: string) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error('Business not selected');
      return garmentWorkshopApi.deliverLot(workspaceId, lotId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['garment-lot-detail', workspaceId, lotId] });
      qc.invalidateQueries({ queryKey: ['garment-lots', workspaceId] });
      qc.invalidateQueries({ queryKey: ['garment-workshop-summary', workspaceId] });
    },
  });
}
