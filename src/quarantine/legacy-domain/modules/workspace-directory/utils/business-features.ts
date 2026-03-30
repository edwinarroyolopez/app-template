import type { OperationalWorkspaceContext } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import type { WorkspaceModuleFeature } from '@/types/workspace-operational';
import { resolveWorkspaceModuleFeaturesByType } from '@/types/workspace-operational';

export function hasWorkspaceModuleFeature(
  context: OperationalWorkspaceContext | null | undefined,
  feature: WorkspaceModuleFeature,
): boolean {
  const declared = context?.workspaceModuleFeatures;

  if (Array.isArray(declared) && declared.length > 0) {
    return declared.includes(feature);
  }

  const fallback = resolveWorkspaceModuleFeaturesByType(context?.workspace?.type);
  return fallback.includes(feature);
}
