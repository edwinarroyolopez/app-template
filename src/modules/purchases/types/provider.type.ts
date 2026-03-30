export type Provider = {
  _id?: string;
  id?: string;
  workspaceId?: string;
  name: string;
  phone?: string;
  address?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt?: string | number;
  updatedAt?: string | number;
};
