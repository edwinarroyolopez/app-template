// src/modules/analytics/components/ExecutiveSummaryCard.tsx
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { theme } from '@/theme';

export function ExecutiveSummaryCard({ data }: { data: any }) {
    const { current, variation } = data;

    const isPositive = variation.net && variation.net >= 0;

    const Icon = isPositive ? TrendingUp : TrendingDown;
    const mainColor = isPositive
        ? theme.colors.success
        : theme.colors.danger;

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <Icon size={18} color={mainColor} />
                <Text style={styles.title}>
                    Resumen ejecutivo
                </Text>
            </View>

            <Text style={styles.subtitle}>
                Comparado con periodo anterior
            </Text>

            {/* METRICS */}
            <ScrollView
                horizontal
                style={styles.metricsScroll}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.metricsRow}
            >
                <Metric
                    label="Utilidad"
                    value={current.net}
                    varValue={variation.net}
                />
                <Metric
                    label="Ingresos"
                    value={current.incomes}
                    varValue={variation.incomes}
                />
                <Metric
                    label="Costos"
                    value={current.expenses}
                    varValue={variation.expenses}
                />
            </ScrollView>
        </View>
    );
}

function Metric({
    label,
    value,
    varValue,
}: {
    label: string;
    value: number;
    varValue: number | null;
}) {
    const isPositive = varValue !== null && varValue >= 0;

    const color = isPositive
        ? theme.colors.success
        : theme.colors.danger;

    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>
                {label}
            </Text>

            <Text style={styles.metricValue}>
                $ {value.toLocaleString()}
            </Text>

            {varValue !== null && (
                <Text style={[styles.metricVariation, { color }]}>
                    {varValue >= 0 ? '+' : ''}
                    {varValue}%
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.xs,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    title: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    subtitle: {
        color: theme.colors.textMuted,
        fontSize: theme.font.xs,
    },
    metricsScroll: {
        flexGrow: 0,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
    },
    metricCard: {
        minWidth: 108,
        backgroundColor: theme.colors.surfaceSoft,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.sm,
    },
    metricLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    metricValue: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.xs,
    },
    metricVariation: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.medium,
        marginTop: theme.spacing.xs,
    },
});
