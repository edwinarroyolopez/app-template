export type Product = {
  _id: string;
  accountId: string;
  workspaceIds: string[];
  name: string;
  image?: string;
  sku?: string;
  variant?: string;
  categoryId?: string | null;
  location?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
