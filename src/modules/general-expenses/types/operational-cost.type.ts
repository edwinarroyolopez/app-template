export type LocalOperationalCost = {
    id: string; // uuid local
    workspaceId: string;

    category: string;
    date: string;
    amountCop?: number;
    description?: string;

    // media local
    localAudioPath?: string;
    localImagePath?: string;

    // media remota (cuando sync)
    audioUrl?: string;
    receiptImage?: {
        url: string;
        publicId: string;
    };

    source: 'TEXT' | 'AUDIO';

    syncStatus: 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED';
    createdAt: number;
};
