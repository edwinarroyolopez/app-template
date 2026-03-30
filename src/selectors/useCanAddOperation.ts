import { CapabilityResult } from '@/types/capabilities';
import { useAuthStore } from '@/stores/auth.store';

export const useCanAddOperation = (): CapabilityResult => {
    const caps = useAuthStore((s) => s.accountCapabilities ?? s.capabilities);
    const fallback: CapabilityResult = {
        enabled: false,
        reason: 'ACCOUNT_INACTIVE',
    };

    if (!caps) {
        return fallback;
    }

    return caps.canAddOperations ?? fallback;
};
