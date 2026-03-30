// src/modules/analytics/components/TimeRangeSelector.tsx
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { theme } from '@/theme';

export type TimeRange =
    | 'THIS_WEEK'
    | 'LAST_WEEK'
    | 'THIS_MONTH'
    | 'LAST_MONTH'
    | 'LAST_30';

export const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
    { label: 'Esta semana', value: 'THIS_WEEK' },
    { label: 'Semana pasada', value: 'LAST_WEEK' },
    { label: 'Este mes', value: 'THIS_MONTH' },
    { label: 'Mes anterior', value: 'LAST_MONTH' },
    { label: 'Últimos 30 días', value: 'LAST_30' },
];

type Props = {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
};

export function TimeRangeSelector({ value, onChange }: Props) {
    return (
        <ScrollView
            horizontal
            style={styles.scroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
        >
            {TIME_RANGE_OPTIONS.map(opt => {
                const active = value === opt.value;

                return (
                    <Pressable
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={({ pressed }) => [
                            styles.chip,
                            active ? styles.chipActive : styles.chipIdle,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={active ? styles.chipTextActive : styles.chipTextIdle}>
                            {opt.label}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    chip: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
    },
    chipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    chipIdle: {
        backgroundColor: theme.colors.surfaceSoft,
        borderColor: theme.colors.border,
    },
    chipTextActive: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.bold,
        color: theme.colors.background,
    },
    chipTextIdle: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.medium,
        color: theme.colors.textPrimary,
    },
    pressed: {
        opacity: 0.86,
    },
});
