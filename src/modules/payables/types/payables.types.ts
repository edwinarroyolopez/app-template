// src/modules/payables/types/payables.types.ts

export type PayableStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export type PayableSource = 'MANUAL' | 'EXPENSE' | 'LAVADA_EXPENSE' | 'GENERAL_EXPENSE';

export interface Payable {
    _id: string;
    workspaceId: string;
    operationId?: string;
    vendorName?: string;
    title: string;
    description?: string;
    amountCop: number;
    paidCop: number;
    remainingCop: number;
    status: PayableStatus;
    date: string;
    dueDate?: string;
    source: PayableSource;
    sourceRefId?: string;
    isActive: boolean;
    createdByUserId: string;
    updatedByUserId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePayableInput {
    title: string;
    description?: string;
    amountCop: number;
    date: string;
    dueDate?: string;
    vendorName?: string;
}

export interface UpdatePayableInput {
    title?: string;
    description?: string;
    amountCop?: number;
    date?: string;
    dueDate?: string;
    vendorName?: string;
}

export interface ListPayablesQuery {
    status?: PayableStatus;
    search?: string;
    includeInactive?: boolean;
}

export interface PayablesSummary {
    workspaceId: string;
    open: {
        count: number;
        remainingCop: number;
    };
    paid: {
        count: number;
        amountCop: number;
    };
    cancelled: {
        count: number;
    };
    overdue: {
        count: number;
        remainingCop: number;
    };
}
