import { api } from '@/services/api';
import { storage } from '@/storage/mmkv';
import { Platform } from 'react-native';
import type { AuthUser } from '@/stores/auth.store';
import type { AccountSummary, AccountUsage, WorkspaceSummary } from '@/stores/auth.store';
import type { AccountCapabilities } from '@/types/capabilities';

export async function requestOtp(phone: string) {
    const { data } = await api.post('/auth/request-otp', { phone });
    return data as {
        otpToken: string;
        expiresAt: string;
    };
}

export async function verifyOtp(params: {
    phone: string;
    otpToken: string;
    code: string;
}) {
    const { data } = await api.post('/auth/verify-otp', params);
    return data as {
        accessToken: string;
        user: AuthUser;
    };
}

export async function registerOwner(params: {
    phone: string;
    name: string;
}) {
    const { data } = await api.post('/auth/register', params);
    return data as {
        accessToken: string;
        user: AuthUser & { _id?: string };
    };
}

/** Matches `template-backend` `AuthService.me` (extend when your product adds fields). */
export type MeResponse = {
    user: AuthUser & { accountTier?: string };
    account: {
        id: string;
        tier: string;
        billingPlan: string;
        isActive: boolean;
        setupComplete: boolean;
        permissions: string[];
        subscriptionEndsAt?: string;
        trialEndsAt?: string;
    };
    workspaces: WorkspaceSummary[];
    usage: AccountUsage;
    accountCapabilities: {
        canInviteMembers: { enabled: boolean; reason?: string };
        canCreateWorkspace: { enabled: boolean; reason?: string };
        canUseApi: { enabled: boolean; reason?: string };
        hasTierLimits: boolean;
    };
    capabilities?: MeResponse['accountCapabilities'];
    /** Optional backend payload kept as edge-only data (not starter canon). */
    operationalWorkspaceContexts?: unknown[];
};

export async function getMe() {
    const fcmToken = storage.getString('fcm:token');

    const { data } = await api.get('/auth/me', {
        headers: {
            ...(fcmToken ? { 'x-fcm-token': fcmToken } : {}),
            'x-fcm-platform': Platform.OS,
        },
    });
    return data as MeResponse;
}

export async function registerPushToken(params: {
    token: string;
    platform?: 'android' | 'ios';
    deviceId?: string;
    appVersion?: string;
}) {
    const { data } = await api.post('/auth/push-token', params);
    return data as { ok: boolean };
}

export type AppVersionStatusResponse = {
    platform: string;
    minVersion: string;
    latestVersion: string;
    forceUpdate: boolean;
    message?: string;
};

export async function getAppVersionStatus() {
    const { data } = await api.get<AppVersionStatusResponse>('/app/version-status', {
        params: { platform: Platform.OS },
    });
    return data;
}
