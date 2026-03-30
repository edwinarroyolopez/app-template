export type CapabilityReason =
  | 'PLAN_REQUIRED'
  | 'ROLE_RESTRICTED'
  | 'ACCOUNT_INACTIVE'
  | 'LIMIT_REACHED'
  | 'FEATURE_DISABLED'
  | 'PREMIUM_REQUIRED'
  | 'NOT_OWNER'
  | 'MAX_WORKSPACES_REACHED'
  | 'MAX_MEMBERS_REACHED'
  | 'MAX_OPERATIONS_REACHED';

export interface CapabilityFlag<R extends string = CapabilityReason> {
  enabled: boolean;
  reason?: R;
}

export interface AccountCapabilities {
  canAccessProtectedSurface?: CapabilityFlag;
  canUseAdvancedFeatures?: CapabilityFlag;
  hasOperationalLimits?: boolean;
  featureFlags?: Record<string, CapabilityFlag>;

  canCreateMultipleWorkspaces?: CapabilityFlag;
  canInviteWorkspaceMembers?: CapabilityFlag;
  canAddOperations?: CapabilityFlag;
}

/** Capabilities evaluated inside a rich workspace context (quarantine / example modules). */
export interface WorkspaceContextCapabilities {
  canAccessContext?: CapabilityFlag;
  canManageContext?: CapabilityFlag;
  featureFlags?: Record<string, CapabilityFlag>;

  canEnterWorkspace?: CapabilityFlag;
  canExitWorkspace?: CapabilityFlag;
  canInviteWorkspaceMembers?: CapabilityFlag;
  canManageMembers?: CapabilityFlag;
}

export type CapabilityResult<R extends string = CapabilityReason> = {
  enabled: boolean;
  reason?: R;
};
