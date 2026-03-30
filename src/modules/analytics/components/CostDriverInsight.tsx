// src/modules/analytics/components/CostDriverInsight.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Coins } from 'lucide-react-native';
import { theme } from '@/theme';
import { analyzeCostDrivers } from '../utils/analyzeCostDrivers';

function labelForKey(group: 'OP' | 'EXP', key: string) {
    if (group === 'OP') return key; // category ya viene humano
    // ExpenseType
    const map: Record<string, string> = {
        SUPPLIES: 'Insumos',
        FUEL: 'Combustible',
        FOOD: 'Alimentación',
        MAINTENANCE: 'Mantenimiento',
        OTHER: 'Otros',
    };
    return map[key] ?? key;
}

export function CostDriverInsight({
    totals,
    breakdown,
}: {
    totals: { incomes: number; costsTotal: number; net: number };
    breakdown: {
        expensesByType?: { key: string; total: number }[] | null;
        operationalCostsByCategory?: { key: string; total: number }[] | null;
    };
}) {
    const result = analyzeCostDrivers({
        incomes: totals.incomes,
        net: totals.net,
        costsTotal: totals.costsTotal,
        expensesByType: breakdown.expensesByType,
        operationalCostsByCategory: breakdown.operationalCostsByCategory,
    });

    if (!result) return null;

    const label = labelForKey(result.top.group as any, result.top.key);

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Coins size={14} color={theme.colors.warning} />
                <Text style={styles.title}>Tu principal consumidor de costo</Text>
            </View>

            <Text style={styles.bodyText}>
                El rubro <Text style={styles.boldText}>
                    {label}
                </Text> representa <Text style={styles.boldText}>
                    {result.share}%
                </Text> de tus costos esta semana.
            </Text>

            <Text style={styles.bodyTextSecond}>
                Si reduces <Text style={styles.boldText}>
                    {result.reductionPct}%
                </Text> ese rubro, tu utilidad subiría aprox.{' '}
                <Text style={styles.savedText}>
                    $ {result.saved.toLocaleString()}
                </Text>{' '}
                (neto proyectado: <Text style={styles.boldText}>
                    $ {result.projectedNet.toLocaleString()}
                </Text>).
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surfaceSoft,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    title: {
        fontWeight: theme.weight.bold,
        fontSize: theme.font.sm,
        color: theme.colors.textPrimary,
    },
    bodyText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    bodyTextSecond: {
        marginTop: theme.spacing.xs,
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    boldText: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    savedText: {
        fontWeight: theme.weight.bold,
        color: theme.colors.success,
    },
});
