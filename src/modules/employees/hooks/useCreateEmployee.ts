import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { employeesApi } from '../services/employees.api';
import type { Employee } from '../types/employee.type';

export function useCreateEmployee() {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      lastName: string;
      phone: string;
      role: Employee['role'];
      isSystemUser?: boolean;
      userId?: string;
      workspaceIds?: string[];
    }) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return employeesApi.createEmployee(workspaceId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees', workspaceId] });
    },
  });
}
