import { useAuthStore } from '@/stores/auth.store';
import type { CapabilityResult, CapabilityReason } from '@/types/capabilities';

/** Account-level: may the user create another workspace (maps from backend `canCreateWorkspace`). */
export const useCanCreateWorkspace = (): CapabilityResult<CapabilityReason> => {
    const caps = useAuthStore((s) => s.accountCapabilities ?? s.capabilities);
    const fallback: CapabilityResult<CapabilityReason> = {
        enabled: false,
        reason: 'ACCOUNT_INACTIVE',
    };

    if (!caps) {
        return fallback;
    }

    return caps.canCreateMultipleWorkspaces ?? fallback;
};
