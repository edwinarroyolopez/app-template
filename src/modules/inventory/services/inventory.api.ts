import { api } from '@/services/api';

export const inventoryApi = {
  async flashAdjust(
    workspaceId: string,
    payload: { productId: string; physicalStock: number; reason?: string },
  ): Promise<any> {
    const { data } = await api.post(`/workspaces/${workspaceId}/inventory/flash-adjustments`, payload);
    return data;
  },

  async getActiveAudit(workspaceId: string): Promise<any | null> {
    const { data } = await api.get(`/workspaces/${workspaceId}/inventory/audits/active`);
    return data;
  },

  async startAudit(workspaceId: string): Promise<any> {
    const { data } = await api.post(`/workspaces/${workspaceId}/inventory/audits/start`);
    return data;
  },

  async upsertAuditItem(
    workspaceId: string,
    auditId: string,
    payload: { productId: string; physicalStock: number },
  ): Promise<any> {
    const { data } = await api.patch(`/workspaces/${workspaceId}/inventory/audits/${auditId}/items`, payload);
    return data;
  },

  async finalizeAudit(workspaceId: string, auditId: string): Promise<any> {
    const { data } = await api.post(`/workspaces/${workspaceId}/inventory/audits/${auditId}/finalize`);
    return data;
  },

  async listEvents(workspaceId: string, limit = 60): Promise<any[]> {
    const { data } = await api.get(`/workspaces/${workspaceId}/inventory/events`, { params: { limit } });
    return data;
  },

  async getLastLiquidation(workspaceId: string): Promise<any | null> {
    const { data } = await api.get(`/workspaces/${workspaceId}/inventory/audits/last`);
    return data;
  },

  async getLiquidationDetail(workspaceId: string, auditId: string): Promise<any> {
    const { data } = await api.get(`/workspaces/${workspaceId}/inventory/audits/${auditId}/detail`);
    return data;
  },
};
