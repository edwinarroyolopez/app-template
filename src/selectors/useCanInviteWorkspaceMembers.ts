import { CapabilityResult } from '@/types/capabilities';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useAuthStore } from '@/stores/auth.store';

export const useCanInviteWorkspaceMembers = (): CapabilityResult => {
  const activeWorkspaceContext = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext);
  const role = useAuthStore((s) => s.user?.role);

  if (!activeWorkspaceContext) {
    return { enabled: false, reason: 'ACCOUNT_INACTIVE' };
  }

  const cap = activeWorkspaceContext.capabilities?.canInviteWorkspaceMembers;
  if (cap) return cap;

  const canWrite = role === 'OWNER' || role === 'ADMIN';

  if (!canWrite) return { enabled: false, reason: 'NOT_OWNER' };

  return { enabled: true };
};
