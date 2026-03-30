// src/modules/analytics/services/analytics.api.ts
import { api } from '@/services/api';

export async function getWeeklyWorkspaceAnalytics(workspaceId: string) {
    const { data } = await api.get(
        `/analytics/workspaces/${workspaceId}/weekly`,
    );
    return data;
}


export async function getWorkspaceHistory(workspaceId: string, weeks = 8) {
    const { data } = await api.get(
        `/analytics/workspaces/${workspaceId}/history?weeks=${weeks}`,
    );
    return data as {
        weekLabel: string;
        incomes: number;
        expenses: number;
        operationalCosts: number;
        net: number;
    }[];
}


export async function comparePeriods(
    workspaceId: string,
    params: {
        from: string;
        to: string;
        prevFrom: string;
        prevTo: string;
    }
) {
    const { data } = await api.get(
        `/analytics/workspaces/${workspaceId}/compare`,
        { params }
    );
    return data;
}

export async function getWorkspaceCostBreakdown(workspaceId: string, params: {
    from: string;
    to: string;
}) {
    const { data } = await api.get(`/analytics/workspaces/${workspaceId}/cost-breakdown`, {
        params,
    });
    return data as {
        workspaceId: string;
        week: string;
        totals: {
            incomes: number;
            expenses: number;
            operationalCosts: number;
            costsTotal: number;
            net: number;
        };
        breakdown: {
            expensesByType: { key: string; total: number }[];
            operationalCostsByCategory: { key: string; total: number }[];
        };
    };
}


