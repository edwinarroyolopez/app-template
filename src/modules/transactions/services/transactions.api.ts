import { api } from '@/services/api';
import type { TransactionItem, TransactionKind, TransactionPeriod, TransactionsSummary } from '../types/transaction.type';

export const transactionsApi = {
  async list(
    workspaceId: string,
    query?: {
      period?: TransactionPeriod;
      kind?: TransactionKind;
    },
  ): Promise<TransactionItem[]> {
    const { data } = await api.get<TransactionItem[]>(`/workspaces/${workspaceId}/transactions`, {
      params: query || {},
    });
    return data;
  },

  async summary(
    workspaceId: string,
    query?: {
      period?: TransactionPeriod;
      kind?: TransactionKind;
    },
  ): Promise<TransactionsSummary> {
    const { data } = await api.get<TransactionsSummary>(`/workspaces/${workspaceId}/transactions/summary`, {
      params: query || {},
    });
    return data;
  },

  async createManual(
    workspaceId: string,
    payload: {
      kind: TransactionKind;
      amountCop: number;
      date: string;
      category?: string;
      title?: string;
      notes?: string;
      proof?: {
        url: string;
        publicId?: string;
        label?: string;
      };
    },
  ): Promise<TransactionItem> {
    const { data } = await api.post<TransactionItem>(`/workspaces/${workspaceId}/transactions`, payload);
    return data;
  },
};
