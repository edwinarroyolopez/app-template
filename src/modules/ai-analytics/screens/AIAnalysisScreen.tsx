// src/modules/ai-analytics/screens/AIAnalysisScreen.tsx
import { View, Text, Pressable, FlatList } from 'react-native';
import { Brain, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { Loader } from '@/components/ui/Loader';
import { ActionLoader } from '@/components/ui/ActionLoader';
import Toast from 'react-native-toast-message';

import { theme } from '@/theme';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { buildRangesFromPreset } from '@/modules/analytics/utils/timeRanges';
import { useRequireActiveWorkspace } from '@/hooks/useRequireActiveWorkspace';

export default function AIAnalysisScreen() {
    const activeWorkspaceId = useRequireActiveWorkspace();
    const nav = useNavigation<any>();
    const ranges = buildRangesFromPreset('LAST_30');

    const { latest, history, generate } = useAIAnalysis();
    const [processing, setProcessing] = useState(false);

    if (!activeWorkspaceId) return null;

    if (latest.isLoading) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Cargando inteligencia…" />
                </Screen>
            </MainLayout>
        );
    }

    async function handleGenerate() {
        if (generate.isPending) return;

        try {
            setProcessing(true);

            await generate.mutateAsync({
                from: ranges.from,
                to: ranges.to,
            });

            setProcessing(false);

            Toast.show({
                type: 'success',
                text1: 'Análisis generado',
                text2: 'La inteligencia ha sido actualizada',
            });
        } catch (err: any) {
            setProcessing(false);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Error desconocido';

            Toast.show({
                type: 'error',
                text1: 'Error al generar análisis',
                text2: message,
            });
        }
    }

    return (
        <MainLayout>
            <View style={{ flex: 1 }}>
                {/* HEADER */}
                <Card>
                    <RefreshHeader
                        title="Analysis AI"
                        subtitle="Diagnóstico cognitivo del negocio"
                        icon={<Brain size={20} color={theme.colors.accent} />}
                        isFetching={latest.isFetching}
                        onRefresh={latest.refetch}
                        helpKey="ai_analysis_help"
                    />
                </Card>

                {/* CTA */}
                <Pressable
                    disabled={generate.isPending}
                    onPress={handleGenerate}
                    style={{
                        marginTop: theme.spacing.md,
                        backgroundColor: theme.colors.accent,
                        paddingVertical: 14,
                        borderRadius: theme.radius.lg,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: generate.isPending ? 0.6 : 1,
                    }}
                >
                    <Sparkles size={18} color="#000" />
                    <Text style={{ fontWeight: theme.weight.bold, color: '#000' }}>
                        {generate.isPending ? 'Generando…' : 'Generar análisis AI'}
                    </Text>
                </Pressable>

                {/* LAST */}
                {latest.data && (
                    <Pressable
                        onPress={() =>
                            nav.navigate('AIAnalysisDetail', {
                                analysis: latest.data,
                            })
                        }
                    >
                        <Card>
                            <Text style={{ fontWeight: theme.weight.bold }}>
                                Último análisis
                            </Text>
                            <Text
                                numberOfLines={3}
                                style={{
                                    marginTop: 6,
                                    color: theme.colors.textMuted,
                                }}
                            >
                                {latest.data.summary}
                            </Text>
                        </Card>
                    </Pressable>
                )}

                {/* HISTORY */}
                {history.data && (
                    <FlatList
                        data={history.data}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{
                            paddingTop: theme.spacing.md,
                        }}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() =>
                                    nav.navigate('AIAnalysisDetail', {
                                        analysis: item,
                                    })
                                }
                            >
                                <Card>
                                    <Text
                                        style={{
                                            fontWeight: theme.weight.bold,
                                            color: theme.colors.textPrimary,
                                        }}
                                    >
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: theme.font.xs,
                                            color: theme.colors.textMuted,
                                        }}
                                    >
                                        {item.model}
                                    </Text>
                                </Card>
                            </Pressable>
                        )}
                    />
                )}

                <ActionLoader
                    visible={processing}
                    steps={[
                        'Recolectando datos…',
                        'Analizando patrones…',
                        'Ejecutando modelos AI…',
                        'Generando diagnóstico…',
                        'Finalizando análisis…',
                    ]}
                />

                <Toast />
            </View>
        </MainLayout>
    );
}
