// src/modules/analytics/screens/BusinessHistoryScreen.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TrendingUp, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { useWorkspaceHistory } from '../hooks/useWorkspaceHistory';
import { NetHistoryChart } from '../components/NetHistoryChart';

export default function WorkspaceHistoryScreen() {
    const nav = useNavigation<any>();

    const { data, isLoading, isFetching, refetch } =
        useWorkspaceHistory(8);

    if (isLoading || !data) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Construyendo historial…" />
                </Screen>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <View style={styles.container}>
                {/* ================= BACK ================= */}
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

                {/* ================= HEADER ================= */}
                <Card>
                    <RefreshHeader
                        title="Cómo le ha ido a tu negocio"
                        subtitle="Utilidad neta por semana"
                        icon={
                            <TrendingUp
                                size={20}
                                color={theme.colors.accent}
                            />
                        }
                        isFetching={isFetching}
                        onRefresh={refetch}
                    />
                </Card>

                {/* ================= CHART ================= */}
                <Card>
                    <Text style={styles.chartTitle}>
                        Últimas 8 semanas
                    </Text>

                    <NetHistoryChart data={data} />
                </Card>
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
    chartTitle: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.bold,
        marginBottom: theme.spacing.sm,
        color: theme.colors.textSecondary,
    },
    pressed: {
        opacity: 0.86,
    },
});
