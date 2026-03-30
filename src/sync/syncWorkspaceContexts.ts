import { getLocalWorkspaceContexts, updateLocalWorkspaceContext } from '@/quarantine/legacy-domain/storage/workspaces.local';
import { api } from '@/services/api';
import { queryClient } from '@/services/queryClient';

/** Syncs locally created workspace contexts (quarantine sample) to the API. */
export async function syncWorkspaceContexts() {
    const local = getLocalWorkspaceContexts();
    if (!local.length) return;

    let didSync = false;

    for (const item of local) {
        if (item.syncStatus !== 'LOCAL') continue;

        const workspaceId = item.workspace.id;

        try {
            updateLocalWorkspaceContext(workspaceId, {
                syncStatus: 'SYNCING',
            });

            await api.post(`/workspaces`, {
                name: item.workspace.name,
                type: item.workspace.type,
                settlementType: item.workspace.settlementType,
            });

            updateLocalWorkspaceContext(workspaceId, {
                syncStatus: 'SYNCED',
            });

            didSync = true;
        } catch (e) {
            console.error('Error sync workspace context', e);
            updateLocalWorkspaceContext(workspaceId, {
                syncStatus: 'FAILED',
            });
        }
    }

    if (didSync) {
        queryClient.invalidateQueries({
            queryKey: ['my-workspaces'],
        });
    }
}
