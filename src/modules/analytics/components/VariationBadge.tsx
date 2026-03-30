// src/modules/analytics/components/VariationBadge.tsx
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { theme } from '@/theme';

export function VariationBadge({
    value,
}: {
    value: number | null;
}) {
    if (value === null)
        return (
            <Text style={styles.emptyText}>
                Sin histórico
            </Text>
        );

    const positive = value >= 0;

    return (
        <View style={[styles.container, positive ? styles.positiveBg : styles.negativeBg]}>
            {positive ? (
                <ArrowUp size={12} color={theme.colors.success} />
            ) : (
                <ArrowDown size={12} color={theme.colors.danger} />
            )}
            <Text style={[styles.valueText, positive ? styles.positiveText : styles.negativeText]}>
                {positive ? '+' : ''}
                {value}%
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    positiveBg: {
        backgroundColor: `${theme.colors.success}22`,
    },
    negativeBg: {
        backgroundColor: `${theme.colors.danger}22`,
    },
    valueText: {
        fontWeight: theme.weight.bold,
        fontSize: theme.font.xs,
    },
    positiveText: {
        color: theme.colors.success,
    },
    negativeText: {
        color: theme.colors.danger,
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontSize: theme.font.xs,
    },
});
