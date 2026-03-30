import { Users } from 'lucide-react-native';

import { LimitBanner } from '@/components/LimitBanner/LimitBanner';
import { useAuthStore } from '@/stores/auth.store';
import { theme } from '@/theme';

/**
 * Account-level member limits from `usage.members` (canonical `/auth/me` shape).
 * Example-only module copy; not on starter navigator.
 */
export function MembersLimitBanner() {
    const usage = useAuthStore((s) => s.usage);
    const account = useAuthStore((s) => s.account);

    if (!usage) return null;

    const tier = account?.tier ?? '';
    const isPremium =
        !!account?.isActive &&
        (tier === 'PREMIUM' || tier === 'PRO' || tier === 'PREMIUM_PLUS');

    if (isPremium) return null;

    const max = usage.members.max;

    const unlimited =
        max === Infinity ||
        max === null ||
        max === undefined ||
        max === -1;

    if (unlimited) return null;

    const current = usage.members.used;
    const nearLimit = max - current <= 2;

    return (
        <LimitBanner
            show={true}
            title="Límite de operadores (Plan BASIC)"
            subtitle={`Máximo ${max} miembros por cuenta · ${current} en uso`}
            icon={<Users size={14} color={theme.colors.textPrimary} />}
            nearLimit={nearLimit}
        />
    );
}
