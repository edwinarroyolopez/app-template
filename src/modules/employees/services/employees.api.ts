import { api } from '@/services/api';
import type { Employee } from '../types/employee.type';

export const employeesApi = {
  async listEmployees(
    workspaceId: string,
    query?: { q?: string; role?: Employee['role'] },
  ): Promise<Employee[]> {
    const params: any = {};
    if (query?.q) params.q = query.q;
    if (query?.role) params.role = query.role;

    const { data } = await api.get<Employee[]>(`/workspaces/${workspaceId}/employees`, { params });
    return data;
  },

  async createEmployee(
    workspaceId: string,
    payload: {
      name: string;
      lastName: string;
      phone: string;
      role: Employee['role'];
      isSystemUser?: boolean;
      userId?: string;
      workspaceIds?: string[];
    },
  ): Promise<Employee> {
    const { data } = await api.post<Employee>(`/workspaces/${workspaceId}/employees`, payload);
    return data;
  },

  async deactivateEmployee(workspaceId: string, employeeId: string): Promise<Employee> {
    const { data } = await api.delete<Employee>(`/workspaces/${workspaceId}/employees/${employeeId}`);
    return data;
  },

  async updateEmployee(
    workspaceId: string,
    employeeId: string,
    payload: {
      role?: Employee['role'];
      managedWorkspaceId?: string;
      clearManagedWorkspace?: boolean;
    },
  ): Promise<Employee> {
    const { data } = await api.patch<Employee>(`/workspaces/${workspaceId}/employees/${employeeId}`, payload);
    return data;
  },
};
