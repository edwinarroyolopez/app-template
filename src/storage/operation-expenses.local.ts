import { storage } from './mmkv';

type ExpenseType = 'MATERIAL' | 'LABOR' | 'TRANSPORT' | 'OTHER';

export type LocalExpense = {
    id: string; // uuid local
    _id?: string; // uuid remoto
    workspaceId: string;
    operationId: string;

    type: ExpenseType;
    amountCop: number;
    description?: string;

    localImagePath?: string;
    receiptImage?: {
        url: string;
        publicId?: string;
    };
    isPayable: boolean;
    vendorName?: string;

    syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
    createdAt: number;
};

const KEY = 'expenses-local';

export function getLocalExpenses(): LocalExpense[] {
    const raw = storage.getString(KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveLocalExpenses(items: LocalExpense[]) {
    storage.set(KEY, JSON.stringify(items));
}

export function addLocalExpense(item: LocalExpense) {
    const current = getLocalExpenses();
    saveLocalExpenses([item, ...current]);
}

export function updateLocalExpense(
    id: string,
    patch: Partial<LocalExpense>,
) {
    const current = getLocalExpenses();
    saveLocalExpenses(
        current.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
        ),
    );
}

export function saveRemoteExpensesToLocal(remoteExpenses: any[]) {
    const local = getLocalExpenses();

    const localMap = new Map(local.map(l => [l.id, l]));

    remoteExpenses.forEach(remote => {
        localMap.set(remote._id, {
            ...remote,
            id: remote._id,
            syncStatus: 'SYNCED',
            updatedAt: Date.now()
        });
    });

    const merged = Array.from(localMap.values());
    saveLocalExpenses(merged);
}
