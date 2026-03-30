import type { AuthUser } from '@/stores/auth.store';
import type { OperationalWorkspaceContext } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

/**
 * Example domain hooks expect a rich `OperationalWorkspaceContext`.
 * The starter backend only exposes flat `workspaces` on `/auth/me`; this builds a minimal context.
 */
export function minimalOperationalContextFromWorkspaceSummary(
  workspace: { id: string; name: string },
  user: AuthUser,
): OperationalWorkspaceContext {
  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      type: 'STORE',
    },
    membership: {
      id: `${workspace.id}-membership`,
      puestoCount: 0,
      isInside: true,
      role: user.role,
    },
    capabilities: {},
    workspaceModuleFeatures: [],
  };
}
