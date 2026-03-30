import { CapabilityResult } from '@/types/capabilities';
import { useAuthStore } from '@/stores/auth.store';
import { useCanAddOperation } from './useCanAddOperation';

export const useCanCreateOperation = (): CapabilityResult => {
    const role = useAuthStore((s) => s.user?.role);
    const planCapability = useCanAddOperation();

    // OWNER_VIEWER cannot create operations
    const canWrite = role === 'OWNER' || role === 'ADMIN';

    if (!canWrite) return { enabled: false, reason: 'NOT_OWNER' };

    // Otherwise return plan-based capability
    return planCapability;
};
