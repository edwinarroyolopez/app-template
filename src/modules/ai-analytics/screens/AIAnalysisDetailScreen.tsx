// src/modules/ai-analytics/screens/AIAnalysisDetailScreen.tsx
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ArrowLeft, Brain } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { theme } from '@/theme';

import { parseAnalysis } from '../utils/parseAnalysis';
import { analysisIcons } from '../utils/analysisIcons';

export default function AIAnalysisDetailScreen() {
    const nav = useNavigation<any>();
    const route = useRoute<any>();
    const { analysis } = route.params;

    const sections = parseAnalysis(analysis.summary);

    return (
        <MainLayout>
            <Screen>
                {/* BACK */}
                <Pressable
                    onPress={() => nav.goBack()}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                    <ArrowLeft size={18} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textSecondary }}>
                        Volver
                    </Text>
                </Pressable>

                {/* HEADER */}
                <Card>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Brain size={22} color={theme.colors.accent} />
                        <View>
                            <Text
                                style={{
                                    fontSize: theme.font.xl,
                                    fontWeight: theme.weight.bold,
                                    color: theme.colors.textPrimary,
                                }}
                            >
                                Informe AI
                            </Text>
                            <Text style={{ fontSize: theme.font.xs, color: theme.colors.textMuted }}>
                                {new Date(analysis.createdAt).toLocaleString()} · {analysis.model}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* CONTENT */}
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: theme.spacing.xl,
                        gap: theme.spacing.md,
                    }}
                >
                    {sections.map((section, idx) => {
                        const Icon =
                            Object.entries(analysisIcons).find(([key]) =>
                                section.title.includes(key),
                            )?.[1] || Brain;

                        return (
                            <Card key={idx}>
                                {/* Section Header */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor:
                                                theme.colors.accent + '20',
                                            padding: 6,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <Icon
                                            size={18}
                                            color={theme.colors.accent}
                                        />
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: theme.font.md,
                                            fontWeight: theme.weight.bold,
                                            color: theme.colors.textPrimary,
                                        }}
                                    >
                                        {section.title}
                                    </Text>
                                </View>

                                {/* Section Content */}
                                {section.content
                                    .split('\n')
                                    .filter(Boolean)
                                    .map((line, i) => (
                                        <Text
                                            key={i}
                                            style={{
                                                fontSize: theme.font.sm,
                                                lineHeight: 22,
                                                color: theme.colors.textSecondary,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {line.replace(/^\*\s?/, '• ')}
                                        </Text>
                                    ))}
                            </Card>
                        );
                    })}
                </ScrollView>
            </Screen>
        </MainLayout>
    );
}
