import { CapabilityResult } from '@/types/capabilities';
import { useAuthStore } from '@/stores/auth.store';

export const useCanCreateExpense = (): CapabilityResult => {
    const role = useAuthStore((s) => s.user?.role);

    // OWNER_VIEWER cannot create expenses
    const canWrite = role === 'OWNER' || role === 'ADMIN';

    if (!canWrite) return { enabled: false, reason: 'NOT_OWNER' };

    // All other roles can create expenses
    return { enabled: true };
};
