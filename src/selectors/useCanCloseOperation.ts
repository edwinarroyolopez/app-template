import { CapabilityResult } from '@/types/capabilities';
import { useAuthStore } from '@/stores/auth.store';

export const useCanCloseOperation = (): CapabilityResult => {
    const role = useAuthStore((s) => s.user?.role);

    // OWNER_VIEWER cannot close operations
    const canWrite = role === 'OWNER' || role === 'ADMIN';

    if (!canWrite) return { enabled: false, reason: 'NOT_OWNER' };

    // All other roles can close operations
    return { enabled: true };
};
