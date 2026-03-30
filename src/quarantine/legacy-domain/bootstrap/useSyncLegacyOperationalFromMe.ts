/**
 * @quarantine — Not part of starter canon.
 * Keeps `useOperationalWorkspaceContextStore` aligned with `/auth/me` for example domain modules only.
 * Invoked from `RootNavigator` so `useMe` stays auth-only.
 */
import { useEffect } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/auth.store';
import type { MeResponse } from '@/modules/auth/services/auth.api';
import { syncOperationalWorkspaceContextsFromMe } from '@/quarantine/legacy-domain/bootstrap/syncOperationalContextsFromMe';

export function useSyncLegacyOperationalFromMe(meQuery: UseQueryResult<MeResponse, Error>) {
    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        if (!meQuery.data || !token) return;

        const data = meQuery.data;
        const user = {
            id: data.user.id,
            phone: data.user.phone,
            name: data.user.name ?? '',
            role: data.user.role as any,
            employeeRole: data.user.employeeRole,
        };

        syncOperationalWorkspaceContextsFromMe(data, user);
    }, [meQuery.data, token]);
}
