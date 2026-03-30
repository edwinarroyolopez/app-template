// src/modules/analytics/components/NetTrendInsight.tsx
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react-native';
import { theme } from '@/theme';
import { analyzeNetTrend } from '../utils/analyticsNetTrend';

export function NetTrendInsight({
    data,
}: {
    data: { weekLabel: string; net: number }[];
}) {
    const result = analyzeNetTrend(data);

    if (!result) return null;

    const { trend, variation, projected, weeks } = result;

    let title = '';
    let message = '';
    let tone: 'up' | 'down' | 'mixed' = 'mixed';

    if (trend === 'UP') {
        title = 'Tendencia positiva';
        message = `Tu utilidad neta lleva ${weeks} semanas creciendo${variation ? ` (+${variation}%)` : ''
            }.  
Si mantienes este ritmo, podrías cerrar el próximo mes en ~$ ${projected.toLocaleString()}.`;
        tone = 'up';
    }

    if (trend === 'DOWN') {
        title = 'Tendencia negativa';
        message = `Tu utilidad neta viene cayendo en las últimas semanas${variation ? ` (${variation}%)` : ''
            }.  
Revisa costos y eficiencia antes de que impacte el flujo de caja.`;
        tone = 'down';
    }

    if (trend === 'MIXED') {
        title = 'Tendencia inestable';
        message = `Tu utilidad neta ha sido irregular.  
Hay oportunidades de optimización si estabilizas gastos y producción.`;
        tone = 'mixed';
    }

    const Icon = tone === 'up' ? TrendingUp : tone === 'down' ? TrendingDown : AlertCircle;
    const toneColor = tone === 'up' ? theme.colors.success : tone === 'down' ? theme.colors.danger : theme.colors.warning;

    return (
        <View style={[styles.container, { borderLeftColor: toneColor }]}>
            <View style={styles.titleRow}>
                <Icon size={14} color={toneColor} />
                <Text style={styles.title}>
                {title}
                </Text>
            </View>

            <Text style={styles.message}>
                {message}
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
    message: {
        fontSize: theme.font.sm,
        color: theme.colors.textSecondary,
    },
});
