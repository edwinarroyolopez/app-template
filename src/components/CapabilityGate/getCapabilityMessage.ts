import {
    CapabilityReason,
} from '@/types/capabilities';

type AnyReason = CapabilityReason | 'READ_ONLY_ROLE';

const MAP: Record<AnyReason, string> = {
    PLAN_REQUIRED: 'This action requires a higher plan',
    ROLE_RESTRICTED: 'Your current role cannot perform this action',
    LIMIT_REACHED: 'You reached the starter limit for this action',
    FEATURE_DISABLED: 'This feature is currently disabled',
    PREMIUM_REQUIRED: 'Disponible solo en cuenta Premium',
    NOT_OWNER: 'Solo el dueño puede realizar esta acción',
    ACCOUNT_INACTIVE: 'Cuenta inactiva',
    MAX_WORKSPACES_REACHED: 'Alcanzaste el máximo de workspaces permitidos para tu cuenta',
    MAX_BUSINESSES_REACHED: 'Alcanzaste el máximo de workspaces permitidos para tu cuenta',
    MAX_MEMBERS_REACHED: 'Alcanzaste el máximo de miembros permitidos en este workspace',
    MAX_OPERATIONS_REACHED: 'Alcanzaste el máximo de operations permitidas',
    READ_ONLY_ROLE: 'Modo solo lectura: no puedes realizar esta acción',
};

export function getCapabilityMessage(reason?: string) {
    if (!reason) return 'No disponible';
    return MAP[reason as AnyReason] ?? 'No disponible';
}
