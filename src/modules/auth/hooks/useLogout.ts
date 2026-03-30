import { useAuthStore } from '@/stores/auth.store';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
    const logout = useAuthStore((s) => s.logout);
    const qc = useQueryClient();

    return () => {
        qc.clear();
        useOperationalWorkspaceContextStore.getState().setWorkspaceContexts([]);
        useOperationalWorkspaceContextStore.getState().clearActiveWorkspaceContext();
        logout();
    };
}
