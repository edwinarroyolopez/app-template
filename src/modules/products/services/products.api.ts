import { api } from '@/services/api';
import type { Product } from '../types/product.type';

export const productsApi = {
  async listProducts(
    workspaceId: string,
    query?: { q?: string; stockFilter?: 'ALL' | 'HIGH' | 'LOW' | 'FAVORITE' },
  ): Promise<Product[]> {
    const params: any = {};
    if (query?.q) params.q = query.q;
    if (query?.stockFilter && query.stockFilter !== 'ALL') params.stockFilter = query.stockFilter;

    const { data } = await api.get<Product[]>(`/workspaces/${workspaceId}/products`, { params });
    return data;
  },

  async getProduct(workspaceId: string, productId: string): Promise<Product> {
    const { data } = await api.get<Product>(`/workspaces/${workspaceId}/products/${productId}`);
    return data;
  },

  async createProduct(
    workspaceId: string,
    payload: {
      name: string;
      workspaceIds?: string[];
      image?: string;
      sku?: string;
      variant?: string;
      categoryId?: string;
      location?: string;
      purchasePrice?: number;
      salePrice?: number;
      stock?: number;
      minStock?: number;
    },
  ): Promise<Product> {
    const { data } = await api.post<Product>(`/workspaces/${workspaceId}/products`, payload);
    return data;
  },

  async updateProduct(
    workspaceId: string,
    productId: string,
    payload: {
      name?: string;
        image?: string;
        sku?: string;
        variant?: string;
        categoryId?: string;
        location?: string;
      purchasePrice?: number;
      salePrice?: number;
      stock?: number;
      minStock?: number;
    },
  ): Promise<Product> {
    const { data } = await api.patch<Product>(`/workspaces/${workspaceId}/products/${productId}`, payload);
    return data;
  },
};
