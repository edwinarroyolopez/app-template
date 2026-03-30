// src/modules/analytics/screens/CostsAnalyticsScreen.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Wallet } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { useWorkspaceCostBreakdown } from '../hooks/useWorkspaceCostBreakdown';
import { buildRangesFromPreset } from '../utils/timeRanges';
import { getTimeRangeLabel } from '../utils/timeRangeLabel';


export default function CostsAnalyticsScreen() {
    const nav = useNavigation<any>();
    const route = useRoute<any>();
    const { range } = route.params || {};

    const ranges = buildRangesFromPreset(range);
    const { data, isLoading } = useWorkspaceCostBreakdown(ranges);

    if (isLoading || !data) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Analizando costos…" />
                </Screen>
            </MainLayout>
        );
    }

    const { totals, breakdown } = data;

    return (
        <MainLayout>
            <Screen>
                {/* BACK */}
                <Pressable
                    onPress={() => nav.goBack()}
                    style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
                >
                    <ArrowLeft size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.backText}>
                        Volver
                    </Text>
                </Pressable>

                {/* HEADER */}
                <Card>
                    <View style={styles.headerRow}>
                        <Wallet size={22} color={theme.colors.accent} />
                        <View>
                            <Text style={styles.headerTitle}>
                                ¿En qué se va el dinero?
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                Análisis de costos ({getTimeRangeLabel(range)})
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* KPI */}
                <Card>
                    <Text style={styles.kpiLabel}>
                        Costos totales
                    </Text>

                    <Text style={styles.kpiValue}>
                        $ {totals.costsTotal.toLocaleString()}
                    </Text>
                </Card>

                {/* EXPENSES */}
                <Card>
                    <Text style={styles.sectionTitle}>
                        Gastos por tipo
                    </Text>

                    {(breakdown.expensesByType ?? []).length === 0 ? (
                        <Text style={styles.emptyText}>Sin gastos registrados</Text>
                    ) : (
                        (breakdown.expensesByType ?? []).map((e: any) => (
                            <Row key={e.key} label={e.key} value={e.total} />
                        ))
                    )}
                </Card>

                {/* OP COSTS */}
                <Card>
                    <Text style={styles.sectionTitle}>
                        Costos operativos
                    </Text>

                    {(breakdown.operationalCostsByCategory ?? []).length === 0 ? (
                        <Text style={styles.emptyText}>Sin costos operativos registrados</Text>
                    ) : (
                        (breakdown.operationalCostsByCategory ?? []).map((e: any) => (
                            <Row key={e.key} label={e.key} value={e.total} />
                        ))
                    )}
                </Card>
            </Screen>
        </MainLayout>
    );
}


/* ===== helper row ===== */
function Row({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>
                {label}
            </Text>
            <Text style={styles.rowValue}>
                $ {value.toLocaleString()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    backText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    headerRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    kpiLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    kpiValue: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
        color: theme.colors.danger,
    },
    sectionTitle: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
        fontSize: theme.font.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
        gap: theme.spacing.md,
    },
    rowLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
    },
    rowValue: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        fontSize: theme.font.sm,
    },
    pressed: {
        opacity: 0.86,
    },
    emptyText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
        paddingVertical: theme.spacing.xs,
    },
});
