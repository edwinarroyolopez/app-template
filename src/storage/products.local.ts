import { storage } from './mmkv';

const KEY = 'products-local';

type LocalProductsMap = Record<string, any[]>;

function readMap(): LocalProductsMap {
  const raw = storage.getString(KEY);
  return raw ? JSON.parse(raw) : {};
}

function writeMap(map: LocalProductsMap) {
  storage.set(KEY, JSON.stringify(map));
}

export function getLocalProductsByBusiness(workspaceId: string): any[] {
  const map = readMap();
  return map[workspaceId] || [];
}

export function saveRemoteProductsToLocal(workspaceId: string, products: any[]) {
  const map = readMap();
  map[workspaceId] = products;
  writeMap(map);
}

export function updateLocalProductStock(workspaceId: string, productId: string, stock: number) {
  const map = readMap();
  const current = map[workspaceId] || [];

  map[workspaceId] = current.map((product: any) =>
    product._id === productId ? { ...product, stock: Math.max(0, Math.round(stock)) } : product,
  );

  writeMap(map);
}
