// src/modules/analytics/screens/BusinessesRankingAnalyticsScreen.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
    ArrowLeft,
    PieChart,
    Crown,
    TrendingUp,
    TrendingDown,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { buildRangesFromPreset } from '../utils/timeRanges';
import { useWorkspacesRanking } from '../hooks/useWorkspacesRanking';
import { getTimeRangeLabel } from '../utils/timeRangeLabel';

export default function WorkspacesRankingAnalyticsScreen() {
    const nav = useNavigation<any>();
    const route = useRoute<any>();
    const { range } = route.params;

    const ranges = buildRangesFromPreset(range);
    const { data, isLoading } = useWorkspacesRanking(ranges);

    if (isLoading || !data) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Analizando rendimiento…" />
                </Screen>
            </MainLayout>
        );
    }

    const maxNet = Math.max(...data.ranking.map((m: any) => m.net), 1);

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
                        <View style={styles.headerIconWrap}>
                            <PieChart size={22} color={theme.colors.accent} />
                        </View>

                        <View>
                            <Text style={styles.headerTitle}>
                                Ranking de negocios
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                Comparación de rendimiento ({getTimeRangeLabel(range)})
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Top workspace */}
                <Card>
                    <View style={styles.bestHeaderRow}>
                        <Crown size={18} color={theme.colors.accent} />
                        <Text style={styles.bestHeaderText}>
                            Workspace lider
                        </Text>
                    </View>

                    <Text style={styles.bestBusinessName}>
                        {data.bestBusiness.businessName}
                    </Text>

                    <Text style={styles.bestBusinessValue}>
                        $ {data.bestBusiness.net.toLocaleString()}
                    </Text>
                </Card>

                {/* RANKING LIST */}
                <Card>
                    <Text style={styles.sectionTitle}>
                        Comparativa general
                    </Text>

                    {data.ranking.map((m: any, i: number) => {
                        const width = Math.max((m.net / maxNet) * 100, 4);
                        const isPositive = m.net >= 0;

                        return (
                            <View
                                key={m.workspaceId}
                                style={styles.rankItem}
                            >
                                <View
                                    style={styles.rankItemHeader}
                                >
                                    <View style={styles.rankBusinessRow}>
                                        <Text style={styles.rankIndex}>
                                            #{i + 1}
                                        </Text>
                                        <Text style={styles.rankBusinessName}>
                                            {m.businessName}
                                        </Text>
                                    </View>

                                    <View style={styles.rankValueRow}>
                                        {isPositive ? (
                                            <TrendingUp size={12} color={theme.colors.success} />
                                        ) : (
                                            <TrendingDown size={12} color={theme.colors.danger} />
                                        )}
                                        <Text style={[styles.rankValue, isPositive ? styles.valuePositive : styles.valueNegative]}>
                                            $ {m.net.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>

                                {/* BAR */}
                                <View style={styles.barTrack}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            {
                                                width: `${width}%`,
                                                backgroundColor: isPositive
                                                    ? theme.colors.success
                                                    : theme.colors.danger,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </Card>
            </Screen>
        </MainLayout>
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
    headerIconWrap: {
        backgroundColor: `${theme.colors.accent}20`,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
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
    bestHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    bestHeaderText: {
        fontWeight: theme.weight.bold,
        color: theme.colors.accent,
    },
    bestBusinessName: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
        marginTop: theme.spacing.xs,
        color: theme.colors.textPrimary,
    },
    bestBusinessValue: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.success,
    },
    sectionTitle: {
        fontWeight: theme.weight.bold,
        marginBottom: theme.spacing.sm,
        color: theme.colors.accent,
        fontSize: theme.font.sm,
    },
    rankItem: {
        marginBottom: theme.spacing.sm,
    },
    rankItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    rankBusinessRow: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    rankIndex: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    rankBusinessName: {
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        fontSize: theme.font.sm,
    },
    rankValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    rankValue: {
        fontWeight: theme.weight.bold,
        fontSize: theme.font.sm,
    },
    valuePositive: {
        color: theme.colors.success,
    },
    valueNegative: {
        color: theme.colors.danger,
    },
    barTrack: {
        height: theme.spacing.xs,
        backgroundColor: theme.colors.surfaceSoft,
        borderRadius: theme.radius.sm,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: theme.radius.sm,
    },
    pressed: {
        opacity: 0.86,
    },
});
