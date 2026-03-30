// src/modules/analytics/screens/BusinessWeeklyAnalyticsScreen.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BarChart3, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { useWeeklyWorkspaceAnalytics } from '../hooks/useWeeklyWorkspaceAnalytics';
import { useWorkspaceWeeklyCostBreakdown } from '../hooks/useWorkspaceWeeklyCostBreakdown';
import { KPIBlock } from '../components/KPIBlock';
import { VariationBadge } from '../components/VariationBadge';
import { CostDriverInsight } from '../components/CostDriverInsight';

export default function WorkspaceWeeklyAnalyticsScreen() {
    const nav = useNavigation<any>();

    const { data, isLoading, isFetching, refetch } =
        useWeeklyWorkspaceAnalytics();

    const { data: breakdown } =
        useWorkspaceWeeklyCostBreakdown();

    if (isLoading || !data) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Analizando la negocio…" />
                </Screen>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <View style={styles.container}>
                {/* BACK */}
                <View style={styles.backWrap}>
                    <Pressable
                        onPress={() => nav.goBack()}
                        style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
                    >
                        <ArrowLeft size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.backText}>
                            Volver
                        </Text>
                    </Pressable>
                </View>

                {/* HEADER */}
                <Card>
                    <RefreshHeader
                        title="Así le fue a tu negocio esta semana"
                        subtitle="Resumen financiero inteligente"
                        icon={
                            <BarChart3 size={20} color={theme.colors.accent} />
                        }
                        isFetching={isFetching}
                        onRefresh={refetch}
                    />

                    <View style={styles.variationRow}>
                        <Text style={styles.variationLabel}>
                            Variación vs semana pasada
                        </Text>

                        <VariationBadge value={data.variation} />
                    </View>
                </Card>

                {/* KPIs */}
                <View style={styles.kpisRow}>
                    <KPIBlock
                        label="Ingresos"
                        value={`$ ${(data.incomes ?? 0).toLocaleString()}`}
                        color={theme.colors.success}
                    />
                    <KPIBlock
                        label="Gastos"
                        value={`$ ${((data.expenses ?? 0) + (data.operationalCosts ?? 0)).toLocaleString()}`}
                        color={theme.colors.danger}
                    />
                </View>

                <View style={styles.netWrap}>
                    <KPIBlock
                        label="Utilidad neta"
                        value={`$ ${(data.net ?? 0).toLocaleString()}`}
                        color={
                            (data.net ?? 0) >= 0
                                ? theme.colors.success
                                : theme.colors.danger
                        }
                    />
                </View>

                {/* INSIGHT */}
                {breakdown && (
                    <View style={styles.insightWrap}>
                        <CostDriverInsight
                            totals={breakdown.totals}
                            breakdown={breakdown.breakdown}
                        />
                    </View>
                )}
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backWrap: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    backText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    variationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
        alignItems: 'center',
    },
    variationLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    kpisRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    netWrap: {
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    insightWrap: {
        paddingHorizontal: theme.spacing.md,
    },
    pressed: {
        opacity: 0.86,
    },
});
