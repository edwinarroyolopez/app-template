import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { employeesApi } from '../services/employees.api';

export function useDeactivateEmployee() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return employeesApi.deactivateEmployee(workspaceId, employeeId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees', workspaceId] });
      qc.invalidateQueries({ queryKey: ['sales', workspaceId] });
    },
  });
}
