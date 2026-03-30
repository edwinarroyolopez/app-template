// quarantine/legacy-domain/modules/workspace-directory/hooks/useCreateBusiness.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsOnline } from '@/hooks/useIsOnline';
import { getLocalWorkspaceContexts, saveLocalWorkspaceContexts } from '@/quarantine/legacy-domain/storage/workspaces.local';
import { generateObjectId } from '@/utils/generateId';
import { createBusiness } from '../services/businesses.api';
import type { WorkspaceModuleFeature, WorkspaceOperationalType } from '@/types/workspace-operational';

const OFFLINE_FEATURES_BY_TYPE: Record<WorkspaceOperationalType, WorkspaceModuleFeature[]> = {
    STORE: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'INVENTORY_FLASH', 'INVENTORY_LIQUIDATION', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
    WAREHOUSE: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'SALES', 'CUSTOMERS', 'ORDERS', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
    WAREHOUSE_WITH_FACTORY: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'SALES', 'CUSTOMERS', 'ORDERS', 'MANUFACTURING', 'DELIVERY_FLOW', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
    NIGHTCLUB: ['PURCHASES', 'PROVIDERS', 'INVENTORY', 'EMPLOYEES', 'PAYABLES', 'CASH_CLOSING'],
    GARMENT_WORKSHOP: ['PROVIDERS', 'EMPLOYEES', 'GARMENT_GARMENTS', 'GARMENT_OPERATIONS', 'GARMENT_LOTS', 'GARMENT_PRODUCTION_LOGS', 'GARMENT_ANALYTICS'],
};

export function useCreateBusiness() {
    const qc = useQueryClient();
    const isOnline = useIsOnline();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            type: WorkspaceOperationalType;
            address?: string;
            phone?: string;
            employee?: string;
        }) => {
            if (!isOnline) {
                const id = generateObjectId();
                const local = getLocalWorkspaceContexts();
                local.unshift({
                    workspace: {
                        id,
                        name: data.name,
                        type: data.type,
                        address: data.address,
                        phone: data.phone,
                        employee: data.employee,
                        isActive: true,
                    },
                    membership: {
                        id,
                        puestoCount: 0,
                        isInside: false,
                        role: 'OWNER',
                    },
                    capabilities: {
                        canEnterWorkspace: { enabled: true },
                        canExitWorkspace: { enabled: true },
                        canInviteWorkspaceMembers: { enabled: true },
                        canManageMembers: { enabled: true },
                    },
                    membershipCapabilities: {
                        canEnterWorkspace: { enabled: true },
                        canExitWorkspace: { enabled: true },
                        canInviteWorkspaceMembers: { enabled: true },
                        canManageMembers: { enabled: true },
                    },
                    workspaceOperationalType: data.type,
                    workspaceModuleFeatures: OFFLINE_FEATURES_BY_TYPE[data.type],
                    validEmployeeRoles: data.type === 'GARMENT_WORKSHOP'
                        ? ['WORKSPACE_MANAGER', 'MANUFACTURER', 'GENERAL_SUPPORT']
                        : ['WORKSPACE_MANAGER', 'SELLER', 'GENERAL_SUPPORT'],
                    effectivePermissions: [],
                    syncStatus: 'LOCAL',
                    createdAt: new Date().toISOString(),
                } as any);
                saveLocalWorkspaceContexts(local);

                return {
                    offline: true,
                };
            }

            return createBusiness(data);
        },

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-workspaces'] });
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
