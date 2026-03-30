// src/modules/payables/types/payments.types.ts

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';

export interface Payment {
    _id: string;
    workspaceId: string;
    payableId: string;
    amountCop: number;
    date: string;
    method: PaymentMethod;
    notes?: string;
    isActive: boolean;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentInput {
    amountCop: number;
    date: string;
    method?: PaymentMethod;
    notes?: string;
}
