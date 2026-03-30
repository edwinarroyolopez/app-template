import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import {
    getLocalOperationalCosts,
    saveRemoteOperationalCostsToLocal,
} from '@/storage/general-expenses.local';

export function useGeneralExpenses() {
    const workspaceId = useOperationalWorkspaceContextStore(s => s.activeWorkspaceContext?.workspace.id);

    return useQuery({
        queryKey: ['general-expenses', workspaceId],
        enabled: !!workspaceId,
        queryFn: async () => {
            if (!workspaceId) return [];

            let remote: any[] = [];
            try {
                const res = await api.get(
                    `/workspaces/${workspaceId}/general-expenses`,
                );
                remote = res.data;

                if (remote.length > 0) {
                    saveRemoteOperationalCostsToLocal(remote);
                }
            } catch {
                // 🧠 sin red → seguimos solo con local
            }

            const allLocal = getLocalOperationalCosts()
                .filter(c => c.workspaceId === workspaceId);

            return allLocal.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );

        },
    });
}
