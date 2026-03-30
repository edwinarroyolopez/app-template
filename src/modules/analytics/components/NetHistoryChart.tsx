// src/modules/analytics/components/NetHistoryChart.tsx
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { theme } from '@/theme';

type Item = {
    weekLabel: string;
    net: number;
};

export function NetHistoryChart({ data }: { data: Item[] }) {
    const max = Math.max(...data.map(d => Math.abs(d.net)), 1);

    const best = Math.max(...data.map(d => d.net));
    const worst = Math.min(...data.map(d => d.net));

    return (
        <View style={styles.container}>
            {data.map((item, idx) => {
                const height = (Math.abs(item.net) / max) * 100;
                const isPositive = item.net >= 0;
                const isBest = item.net === best;
                const isWorst = item.net === worst;

                const color = isPositive ? theme.colors.success : theme.colors.danger;
                const Icon = isPositive ? TrendingUp : TrendingDown;

                return (
                    <View
                        key={item.weekLabel + idx}
                        style={styles.row}
                    >
                        {/* Timeline dot */}
                        <View style={[styles.timelineDot, { backgroundColor: color }]} />

                        {/* Bar */}
                        <View
                            style={[
                                styles.bar,
                                {
                                    height: Math.max(height, theme.spacing.sm),
                                    backgroundColor: color,
                                },
                            ]}
                        />

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={styles.weekText}>
                                Semana del {item.weekLabel}
                            </Text>

                            <View style={styles.valueRow}>
                                <Icon size={14} color={color} />

                                <Text style={[styles.valueText, { color }]}>
                                    $ {item.net.toLocaleString()}
                                </Text>

                                {isBest && (
                                    <Text style={[styles.tagText, { color: theme.colors.success }]}> 
                                        MEJOR
                                    </Text>
                                )}

                                {isWorst && (
                                    <Text style={[styles.tagText, { color: theme.colors.danger }]}> 
                                        PEOR
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.sm,
        paddingLeft: theme.spacing.sm,
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.border,
        gap: theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    timelineDot: {
        width: theme.spacing.xs,
        height: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        marginLeft: -theme.spacing.xs,
    },
    bar: {
        width: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        opacity: 0.9,
    },
    content: {
        flex: 1,
    },
    weekText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    valueText: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.bold,
    },
    tagText: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.bold,
    },
});
