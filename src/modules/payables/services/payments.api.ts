// src/modules/payables/services/payments.api.ts
import { api } from '@/services/api';
import type { Payment, CreatePaymentInput } from '../types/payments.types';

export const paymentsApi = {
    /**
     * GET /workspaces/:workspaceId/payables/:payableId/payments
     */
    async listPayments(workspaceId: string, payableId: string): Promise<Payment[]> {
        const { data } = await api.get<Payment[]>(
            `/workspaces/${workspaceId}/payables/${payableId}/payments`,
        );
        return data;
    },

    /**
     * POST /workspaces/:workspaceId/payables/:payableId/payments
     */
    async createPayment(
        workspaceId: string,
        payableId: string,
        input: CreatePaymentInput,
    ): Promise<Payment> {
        const { data } = await api.post<Payment>(
            `/workspaces/${workspaceId}/payables/${payableId}/payments`,
            input,
        );
        return data;
    },

    /**
     * DELETE /workspaces/:workspaceId/payables/:payableId/payments/:paymentId (soft delete)
     */
    async deletePayment(
        workspaceId: string,
        payableId: string,
        paymentId: string,
    ): Promise<Payment> {
        const { data } = await api.delete<Payment>(
            `/workspaces/${workspaceId}/payables/${payableId}/payments/${paymentId}`,
        );
        return data;
    },
};
