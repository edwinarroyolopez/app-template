import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { employeesApi } from '../services/employees.api';
import type { Employee } from '../types/employee.type';

export function useUpdateEmployee() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      payload,
    }: {
      employeeId: string;
      payload: {
        role?: Employee['role'];
        managedWorkspaceId?: string;
        clearManagedWorkspace?: boolean;
      };
    }) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return employeesApi.updateEmployee(workspaceId, employeeId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees', workspaceId] });
    },
  });
}
