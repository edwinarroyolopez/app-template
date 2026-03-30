import { useQuery } from '@tanstack/react-query';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { employeesApi } from '../services/employees.api';
import type { Employee } from '../types/employee.type';

export function useEmployees(search?: string, role?: Employee['role']) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);

  return useQuery({
    queryKey: ['employees', workspaceId, search || 'all', role || 'all-roles'],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) return [];
      return employeesApi.listEmployees(workspaceId, { q: search, role });
    },
  });
}
