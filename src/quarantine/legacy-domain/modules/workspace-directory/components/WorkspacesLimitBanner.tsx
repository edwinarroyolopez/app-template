import { AlertTriangle } from 'lucide-react-native';
import { LimitBanner } from '@/components/LimitBanner/LimitBanner';
import { useAuthStore } from '@/stores/auth.store';

export function WorkspacesLimitBanner() {
    const usage = useAuthStore((s) => s.usage);
    const wsUsage = usage?.workspaces;

    const used = wsUsage?.used ?? 0;
    const max = wsUsage?.max ?? Infinity;

    const isLimited = max !== Infinity;
    const remaining = isLimited ? Math.max(max - used, 0) : Infinity;

    if (!isLimited) return null;

    const nearLimit = remaining <= 1;

    return (
        <LimitBanner
            show
            icon={<AlertTriangle size={14} color="#7C2D12" />}
            title="Workspace limit"
            subtitle={`${used}/${max} workspaces — ${remaining} remaining`}
            nearLimit={nearLimit}
        />
    );
}
