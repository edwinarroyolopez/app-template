import { CapabilityResult } from '@/types/capabilities';
import { useAuthStore } from '@/stores/auth.store';

export const useCanCreateOperationalCost = (): CapabilityResult => {
    const role = useAuthStore((s) => s.user?.role);

    // OWNER_VIEWER cannot create operational costs
    const canWrite = role === 'OWNER' || role === 'ADMIN';

    if (!canWrite) return { enabled: false, reason: 'NOT_OWNER' };

    // All other roles can create operational costs
    return { enabled: true };
};
