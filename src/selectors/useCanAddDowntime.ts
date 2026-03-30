import { CapabilityResult } from '@/types/capabilities';
import { useAuthStore } from '@/stores/auth.store';

export const useCanAddDowntime = (): CapabilityResult => {
    const role = useAuthStore((s) => s.user?.role);

    // OWNER_VIEWER cannot add downtimes
    const canWrite = role === 'OWNER' || role === 'ADMIN';

    if (!canWrite) return { enabled: false, reason: 'NOT_OWNER' };

    // All other roles can add downtimes
    return { enabled: true };
};
