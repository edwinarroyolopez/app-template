import { useMutation } from '@tanstack/react-query';
import { verifyOtp } from '../services/auth.api';
import { useAuthStore } from '@/stores/auth.store';

export function useVerifyOtp() {
    const setSession = useAuthStore((s) => s.setSession);

    return useMutation({
        mutationFn: verifyOtp,
        onSuccess: (res) => {
            const u = res.user as { id?: string; _id?: string };
            setSession({
                token: res.accessToken,
                user: {
                    id: u.id ?? u._id ?? '',
                    phone: res.user.phone,
                    name: res.user.name ?? '',
                    role: res.user.role as any,
                },
                workspaces: [],
                activeWorkspaceId: null,
            });
        },
    });
}
