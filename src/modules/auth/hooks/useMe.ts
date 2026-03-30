// src/modules/auth/hooks/useMe.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/stores/auth.store';
import { useIsOnline } from '@/hooks/useIsOnline';

import { getMe } from '@/modules/auth/services/auth.api';
import type { AccountSummary } from '@/stores/auth.store';
import type { AccountCapabilities } from '@/types/capabilities';
import { registerPushTokenForCurrentUser } from '@/notifications/pushNotifications';
import { flushPendingPushNavigation } from '@/notifications/pushNotifications';

function mapAccount(raw: {
    id: string;
    tier: string;
    billingPlan: string;
    isActive: boolean;
    setupComplete: boolean;
    permissions: string[];
    subscriptionEndsAt?: string;
    trialEndsAt?: string;
}): AccountSummary {
    return {
        id: raw.id,
        tier: raw.tier,
        billingPlan: raw.billingPlan,
        isActive: raw.isActive,
        setupComplete: raw.setupComplete,
        permissions: raw.permissions ?? [],
        subscriptionEndsAt: raw.subscriptionEndsAt,
        trialEndsAt: raw.trialEndsAt,
    };
}

function mapCapabilities(
    raw:
        | {
              canInviteMembers: { enabled: boolean; reason?: string };
              canCreateWorkspace: { enabled: boolean; reason?: string };
              canUseApi: { enabled: boolean; reason?: string };
              hasTierLimits: boolean;
          }
        | undefined,
): AccountCapabilities | null {
    if (!raw) return null;
    return {
        canInviteWorkspaceMembers: raw.canInviteMembers,
        canCreateMultipleWorkspaces: raw.canCreateWorkspace,
        canAccessProtectedSurface: raw.canUseApi,
        hasOperationalLimits: raw.hasTierLimits,
        canAddOperations: { enabled: true },
    };
}

/** Fetches `/auth/me` and hydrates **only** `auth.store` (canonical starter: workspaces, usage, capabilities). */
export function useMe() {
    const setSession = useAuthStore((s) => s.setSession);
    const token = useAuthStore((s) => s.token);

    const isOnline = useIsOnline();

    const query = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        enabled: isOnline && !!token,
    });

    useEffect(() => {
        if (!query.data || !token) return;

        const data = query.data;
        const user = {
            id: data.user.id,
            phone: data.user.phone,
            name: data.user.name ?? '',
            role: data.user.role as any,
            employeeRole: data.user.employeeRole,
        };

        const workspaces = data.workspaces ?? [];

        const activeId = useAuthStore.getState().activeWorkspaceId;
        const nextActive =
            workspaces.some((w) => w.id === activeId) && activeId
                ? activeId
                : workspaces[0]?.id ?? null;

        setSession({
            token,
            user,
            workspaces,
            activeWorkspaceId: nextActive,
            account: mapAccount(data.account),
            capabilities: mapCapabilities(data.accountCapabilities ?? data.capabilities),
            usage: data.usage,
        });

        registerPushTokenForCurrentUser({ force: true });
        flushPendingPushNavigation();
    }, [query.data, token, setSession]);

    return query;
}
