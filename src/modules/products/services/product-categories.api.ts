import { api } from '@/services/api';
import type { ProductCategory } from '../types/product-category.type';

export const productCategoriesApi = {
  async listCategories(workspaceId: string, query?: { q?: string }): Promise<ProductCategory[]> {
    const params: any = {};
    if (query?.q) params.q = query.q;

    const { data } = await api.get<ProductCategory[]>(`/workspaces/${workspaceId}/product-categories`, { params });
    return data;
  },

  async createCategory(
    workspaceId: string,
    payload: {
      name: string;
      code?: string;
    },
  ): Promise<ProductCategory> {
    const { data } = await api.post<ProductCategory>(`/workspaces/${workspaceId}/product-categories`, payload);
    return data;
  },
};
