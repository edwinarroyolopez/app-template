import { api } from '@/services/api';
import type { Provider } from '../types/provider.type';

export const providersApi = {
  async listProviders(workspaceId: string, query?: { search?: string }): Promise<Provider[]> {
    const { data } = await api.get<Provider[]>(`/workspaces/${workspaceId}/providers`, { params: query || {} });
    return data;
  },

  async createProvider(
    workspaceId: string,
    payload: {
      name: string;
      phone?: string;
      address?: string;
      rating?: number;
    },
  ): Promise<Provider> {
    const { data } = await api.post<Provider>(`/workspaces/${workspaceId}/providers`, payload);
    return data;
  },
};
