import { api } from '@/services/api';
import type { PaymentMethod } from '@/types/payment-method';
import type {
  Garment,
  GarmentLot,
  GarmentMachine,
  GarmentOperation,
} from '../types/garment-workshop.types';

export const garmentWorkshopApi = {
  async getSummary(workspaceId: string, params?: { from?: string; to?: string }) {
    const { data } = await api.get(`/workspaces/${workspaceId}/garment-workshop/summary`, {
      params: params || {},
    });
    return data;
  },

  async getWorkersSummary(
    workspaceId: string,
    params?: { from?: string; to?: string },
  ) {
    const { data } = await api.get(
      `/workspaces/${workspaceId}/garment-workshop/workers-summary`,
      {
        params: params || {},
      },
    );
    return data;
  },

  async listOperations(workspaceId: string): Promise<GarmentOperation[]> {
    const { data } = await api.get(`/workspaces/${workspaceId}/garment-workshop/operations`);
    return data;
  },

  async createOperation(
    workspaceId: string,
    payload: {
      name: string;
      machineId?: string;
      unitPriceCop: number;
      sequence?: number;
    },
  ): Promise<GarmentOperation> {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/garment-workshop/operations`,
      payload,
    );
    return data;
  },

  async updateOperation(
    workspaceId: string,
    operationId: string,
    payload: {
      name?: string;
      machineId?: string;
      unitPriceCop?: number;
      sequence?: number;
    },
  ): Promise<GarmentOperation> {
    const { data } = await api.patch(
      `/workspaces/${workspaceId}/garment-workshop/operations/${operationId}`,
      payload,
    );
    return data;
  },

  async deleteOperation(workspaceId: string, operationId: string) {
    const { data } = await api.delete(
      `/workspaces/${workspaceId}/garment-workshop/operations/${operationId}`,
    );
    return data;
  },

  async listMachines(workspaceId: string): Promise<GarmentMachine[]> {
    const { data } = await api.get(`/workspaces/${workspaceId}/garment-workshop/machines`);
    return data;
  },

  async createMachine(
    workspaceId: string,
    payload: { name: string; code?: string },
  ): Promise<GarmentMachine> {
    const { data } = await api.post(`/workspaces/${workspaceId}/garment-workshop/machines`, payload);
    return data;
  },

  async listGarments(workspaceId: string): Promise<Garment[]> {
    const { data } = await api.get(`/workspaces/${workspaceId}/garment-workshop/garments`);
    return data;
  },

  async createGarment(
    workspaceId: string,
    payload: {
      name: string;
      defaultColor?: string;
      operationIds: string[];
      imageUrls?: string[];
    },
  ): Promise<Garment> {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/garment-workshop/garments`,
      payload,
    );
    return data;
  },

  async updateGarment(
    workspaceId: string,
    garmentId: string,
    payload: {
      name?: string;
      defaultColor?: string;
      operationIds?: string[];
      imageUrls?: string[];
    },
  ): Promise<Garment> {
    const { data } = await api.patch(
      `/workspaces/${workspaceId}/garment-workshop/garments/${garmentId}`,
      payload,
    );
    return data;
  },

  async deleteGarment(workspaceId: string, garmentId: string) {
    const { data } = await api.delete(
      `/workspaces/${workspaceId}/garment-workshop/garments/${garmentId}`,
    );
    return data;
  },

  async listLots(
    workspaceId: string,
    params?: { status?: GarmentLot['status'] },
  ): Promise<GarmentLot[]> {
    const { data } = await api.get(`/workspaces/${workspaceId}/garment-workshop/lots`, {
      params: params || {},
    });
    return data;
  },

  async getLot(workspaceId: string, lotId: string) {
    const { data } = await api.get(`/workspaces/${workspaceId}/garment-workshop/lots/${lotId}`);
    return data;
  },

  async createLot(
    workspaceId: string,
    payload: {
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
    },
  ): Promise<GarmentLot> {
    const { data } = await api.post(`/workspaces/${workspaceId}/garment-workshop/lots`, {
      ...payload,
      baseDocumentUrl: payload.baseDocumentEvidenceUrl,
      technicalSheetUrl: payload.technicalSheetEvidenceUrl,
    });
    return data;
  },

  async createLog(
    workspaceId: string,
    lotId: string,
    payload: {
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
    },
  ) {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/garment-workshop/lots/${lotId}/logs`,
      payload,
    );
    return data;
  },

  async updateLot(
    workspaceId: string,
    lotId: string,
    payload: {
      providerId?: string;
      provider?: {
        name: string;
        phone?: string;
        address?: string;
        rating?: number;
      };
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
    },
  ) {
    const { data } = await api.patch(`/workspaces/${workspaceId}/garment-workshop/lots/${lotId}`, payload);
    return data;
  },

  async addLaborPayment(
    workspaceId: string,
    lotId: string,
    payload: {
      employeeId: string;
      amountCop: number;
      paidAt: string;
      paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
      note?: string;
      evidenceUrl?: string;
    },
  ) {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/garment-workshop/lots/${lotId}/labor-payments`,
      payload,
    );
    return data;
  },

  async addLotIncome(
    workspaceId: string,
    lotId: string,
    payload: {
      amountCop: number;
      receivedAt: string;
      paymentMethod?: PaymentMethod;
      note?: string;
      evidenceUrl?: string;
    },
  ) {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/garment-workshop/lots/${lotId}/income`,
      payload,
    );
    return data;
  },

  async addLotCost(
    workspaceId: string,
    lotId: string,
    payload: {
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
    },
  ) {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/garment-workshop/lots/${lotId}/costs`,
      payload,
    );
    return data;
  },

  async deliverLot(workspaceId: string, lotId: string) {
    const { data } = await api.post(`/workspaces/${workspaceId}/garment-workshop/lots/${lotId}/deliver`);
    return data;
  },
};
