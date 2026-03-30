// src/modules/payables/services/payables.api.ts
import { api } from '@/services/api';
import type {
    Payable,
    CreatePayableInput,
    UpdatePayableInput,
    ListPayablesQuery,
    PayablesSummary,
} from '../types/payables.types';

export const payablesApi = {
    /**
     * GET /workspaces/:workspaceId/payables
     */
    async listPayables(workspaceId: string, query?: ListPayablesQuery): Promise<Payable[]> {
        const params: any = {};

        if (query?.status) {
            params.status = query.status;
        }
        if (query?.search) {
            params.search = query.search;
        }
        if (query?.includeInactive !== undefined) {
            params.includeInactive = query.includeInactive ? 'true' : 'false';
        }

        const { data } = await api.get<Payable[]>(`/workspaces/${workspaceId}/payables`, { params });
        return data;
    },

    /**
     * GET /workspaces/:workspaceId/payables/:payableId
     */
    async getPayable(workspaceId: string, payableId: string): Promise<Payable> {
        const { data } = await api.get<Payable>(`/workspaces/${workspaceId}/payables/${payableId}`);
        return data;
    },

    /**
     * POST /workspaces/:workspaceId/payables
     */
    async createPayable(workspaceId: string, input: CreatePayableInput): Promise<Payable> {
        const { data } = await api.post<Payable>(`/workspaces/${workspaceId}/payables`, input);
        return data;
    },

    /**
     * PATCH /workspaces/:workspaceId/payables/:payableId
     */
    async updatePayable(
        workspaceId: string,
        payableId: string,
        input: UpdatePayableInput,
    ): Promise<Payable> {
        const { data } = await api.patch<Payable>(
            `/workspaces/${workspaceId}/payables/${payableId}`,
            input,
        );
        return data;
    },

    /**
     * DELETE /workspaces/:workspaceId/payables/:payableId (soft delete)
     */
    async deletePayable(workspaceId: string, payableId: string): Promise<Payable> {
        const { data } = await api.delete<Payable>(`/workspaces/${workspaceId}/payables/${payableId}`);
        return data;
    },

    /**
     * GET /workspaces/:workspaceId/payables/summary
     */
    async getPayablesSummary(workspaceId: string): Promise<PayablesSummary> {
        const { data } = await api.get<PayablesSummary>(`/workspaces/${workspaceId}/payables/summary`);
        return data;
    },
};
