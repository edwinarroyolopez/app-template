// src/modules/analytics/utils/analyzeCostDrivers.ts
export function analyzeCostDrivers(input: {
    incomes: number;
    net: number;
    costsTotal: number;
    expensesByType?: { key: string; total: number }[] | null;
    operationalCostsByCategory?: { key: string; total: number }[] | null;
}) {
    const all = [
        ...(input.operationalCostsByCategory ?? []).map(x => ({ group: 'OP', key: x.key, total: x.total })),
        ...(input.expensesByType ?? []).map(x => ({ group: 'EXP', key: x.key, total: x.total })),
    ].filter(x => x.total > 0);

    if (!all.length || input.costsTotal <= 0) return null;

    const top = all.sort((a, b) => b.total - a.total)[0];
    const share = (top.total / input.costsTotal) * 100;

    // simulación simple: bajar 10%
    const reductionPct = 10;
    const saved = Math.round(top.total * (reductionPct / 100));
    const projectedNet = input.net + saved;

    return {
        top,
        share: Math.round(share * 10) / 10,
        reductionPct,
        saved,
        projectedNet,
    };
}
