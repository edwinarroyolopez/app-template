import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
    const logout = useAuthStore((s) => s.logout);
    const qc = useQueryClient();

    return () => {
        qc.clear();
        logout();
    };
}
