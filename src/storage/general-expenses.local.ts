import { storage } from './mmkv';

export type LocalOperationalCost = {
    id: string; // uuid local
    workspaceId: string;

    category: string;
    date: string;
    amountCop?: number;
    description?: string;

    source: 'TEXT' | 'AUDIO';

    localAudioPath?: string;
    localImagePath?: string;

    audioUrl?: string;
    receiptImage?: {
        url: string;
        publicId: string;
    };

    syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
    createdAt: number;
};

const KEY = 'operational-costs-local';

export function getLocalOperationalCosts(): LocalOperationalCost[] {
    const raw = storage.getString(KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveLocalOperationalCosts(
    costs: LocalOperationalCost[],
) {
    storage.set(KEY, JSON.stringify(costs));
}

export function addLocalOperationalCost(
    cost: LocalOperationalCost,
) {
    const current = getLocalOperationalCosts();
    saveLocalOperationalCosts([cost, ...current]);
}

export function updateLocalOperationalCost(
    id: string,
    patch: Partial<LocalOperationalCost>,
) {
    const current = getLocalOperationalCosts();
    saveLocalOperationalCosts(
        current.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
        ),
    );
}

export function saveRemoteOperationalCostsToLocal(remoteCosts: any[]) {
    const local = getLocalOperationalCosts();

    // Creamos un mapa de las locales para actualizar o insertar
    const localMap = new Map(local.map(l => [l.id, l]));

    remoteCosts.forEach(remote => {
        localMap.set(remote._id, {
            ...remote,
            id: remote._id,
            syncStatus: 'SYNCED', // Marcamos como sincronizadas
            updatedAt: Date.now()
        });
    });

    const merged = Array.from(localMap.values());
    saveLocalOperationalCosts(merged);
}

