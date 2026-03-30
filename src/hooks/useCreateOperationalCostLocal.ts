import uuid from 'react-native-uuid';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import {
    addLocalOperationalCost,
} from '@/storage/general-expenses.local';
import { persistMedia } from '@/utils/mediaStorage';

export function useCreateOperationalCostLocal() {
    const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

    async function create({
        category,
        date,
        amountCop,
        description,
        audio,
        image,
    }: {
        category: string;
        date: string;
        amountCop?: number;
        description?: string;
        audio?: { uri: string };
        image?: { uri: string };
    }) {
        if (!workspaceId) throw new Error('No active business');

        const id = uuid.v4();

        const localAudioPath = audio
            ? await persistMedia(audio.uri, 'audio')
            : undefined;

        const localImagePath = image
            ? await persistMedia(image.uri, 'image')
            : undefined;

        addLocalOperationalCost({
            id,
            workspaceId,
            category,
            date,
            amountCop,
            description,
            source: audio ? 'AUDIO' : 'TEXT',
            localAudioPath,
            localImagePath,
            syncStatus: 'LOCAL',
            createdAt: Date.now(),
        });
    }

    return { create };
}
