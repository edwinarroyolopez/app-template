// src/modules/analytics/utils/timeRanges.ts
import { TimeRange } from '../components/TimeRangeSelector';

export function buildRangesFromPreset(preset: TimeRange) {
    const now = new Date();

    function format(d: Date) {
        return d.toISOString().slice(0, 10);
    }

    // Helpers
    function startOfWeek(d: Date) {
        const date = new Date(d);
        const day = date.getDay(); // 0 domingo
        const diff = day === 0 ? -6 : 1 - day; // lunes
        date.setDate(date.getDate() + diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function endOfWeek(d: Date) {
        const start = startOfWeek(d);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    // ================= PRESETS =================

    if (preset === 'THIS_WEEK') {
        const start = startOfWeek(now);
        const end = endOfWeek(now);

        const prevStart = new Date(start);
        prevStart.setDate(start.getDate() - 7);
        const prevEnd = new Date(end);
        prevEnd.setDate(end.getDate() - 7);

        return {
            from: format(start),
            to: format(end),
            prevFrom: format(prevStart),
            prevTo: format(prevEnd),
        };
    }

    if (preset === 'LAST_WEEK') {
        const start = startOfWeek(now);
        start.setDate(start.getDate() - 7);
        const end = endOfWeek(start);

        const prevStart = new Date(start);
        prevStart.setDate(start.getDate() - 7);
        const prevEnd = new Date(end);
        prevEnd.setDate(end.getDate() - 7);

        return {
            from: format(start),
            to: format(end),
            prevFrom: format(prevStart),
            prevTo: format(prevEnd),
        };
    }

    if (preset === 'THIS_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = now;

        const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        return {
            from: format(start),
            to: format(end),
            prevFrom: format(prevStart),
            prevTo: format(prevEnd),
        };
    }

    if (preset === 'LAST_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);

        const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);

        return {
            from: format(start),
            to: format(end),
            prevFrom: format(prevStart),
            prevTo: format(prevEnd),
        };
    }

    if (preset === 'LAST_30') {
        const from = new Date();
        from.setDate(now.getDate() - 30);

        const prevFrom = new Date();
        prevFrom.setDate(now.getDate() - 60);

        const prevTo = new Date();
        prevTo.setDate(now.getDate() - 30);

        return {
            from: format(from),
            to: format(now),
            prevFrom: format(prevFrom),
            prevTo: format(prevTo),
        };
    }

    // fallback (no debería pasar)
    return {
        from: format(now),
        to: format(now),
        prevFrom: format(now),
        prevTo: format(now),
    };
}
