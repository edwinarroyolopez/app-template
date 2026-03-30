// src/modules/ai-analytics/utils/parseAnalysis.ts
export function parseAnalysis(summary: string) {
    const sections = summary
        .split(/\*\*\d+\.\s+/)
        .filter(Boolean);

    return sections.map(block => {
        const [titleLine, ...rest] = block.split('\n');
        return {
            title: titleLine.replace(/\*\*/g, '').trim(),
            content: rest.join('\n').trim(),
        };
    });
}
