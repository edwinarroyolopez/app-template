import { useQuery } from '@tanstack/react-query';
import { getMyWorkspaces } from '../services/businesses.api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useIsOnline } from '@/hooks/useIsOnline';
import {
    getLocalWorkspaceContexts,
    saveRemoteWorkspaceContextsToLocal,
    type LocalWorkspaceContext,
} from '@/quarantine/legacy-domain/storage/workspaces.local';

export function useMyWorkspaces() {
    const setWorkspaceContexts = useOperationalWorkspaceContextStore((s) => s.setWorkspaceContexts);
    const online = useIsOnline();

    return useQuery({
        queryKey: ['my-workspaces'],
        queryFn: async () => {
            if (!online) {
                const local = getLocalWorkspaceContexts();
                setWorkspaceContexts(local as any);
                return local;
            }

            try {
                const remote: LocalWorkspaceContext[] = await getMyWorkspaces();

                if (remote && remote.length > 0) {
                    saveRemoteWorkspaceContextsToLocal(remote);
                }
            } catch (error) {
                console.error('Error fetching workspaces, falling back to local', error);
            }

            const allLocal = getLocalWorkspaceContexts();
            const sorted = allLocal.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });

            setWorkspaceContexts(sorted as any);
            return sorted;
        },
        enabled: true,
    });
}
