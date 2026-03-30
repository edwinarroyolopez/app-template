// src/modules/analytics/utils/analyzeNetTrend.ts
export function analyzeNetTrend(
    data: { weekLabel: string; net: number }[],
) {
    if (data.length < 2) return null;

    const nets = data.map(d => d.net);

    let growthCount = 0;
    let dropCount = 0;

    for (let i = 1; i < nets.length; i++) {
        if (nets[i] > nets[i - 1]) growthCount++;
        if (nets[i] < nets[i - 1]) dropCount++;
    }

    let trend: 'UP' | 'DOWN' | 'MIXED' = 'MIXED';

    if (growthCount === data.length - 1) trend = 'UP';
    else if (dropCount === data.length - 1) trend = 'DOWN';

    const first = nets[0];
    const last = nets[nets.length - 1];

    const variation =
        first === 0 ? null : ((last - first) / first) * 100;

    // proyección simple (media de cambios)
    const diffs = [];
    for (let i = 1; i < nets.length; i++) {
        diffs.push(nets[i] - nets[i - 1]);
    }

    const avgDiff =
        diffs.reduce((a, b) => a + b, 0) / diffs.length;

    const projected = Math.round(last + avgDiff * 4); // 4 semanas más

    return {
        trend,
        variation: variation
            ? Math.round(variation * 10) / 10
            : null,
        projected,
        weeks: data.length,
    };
}
