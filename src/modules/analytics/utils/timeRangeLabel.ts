// src/modules/analytics/utils/timeRangeLabel.ts
import { TIME_RANGE_OPTIONS, TimeRange } from '../components/TimeRangeSelector';

export function getTimeRangeLabel(range: TimeRange) {
    return (
        TIME_RANGE_OPTIONS.find(o => o.value === range)?.label
        || range
    );
}
