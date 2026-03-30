// src/modules/payables/components/SummaryCard.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react-native';
import { theme } from '@/theme';
import type { PayablesSummary } from '../types/payables.types';

type Props = {
    summary?: PayablesSummary;
    isLoading?: boolean;
};

export default function SummaryCard({ summary, isLoading }: Props) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!summary) return;

        Animated.sequence([
            Animated.timing(pulse, {
                toValue: 0.985,
                duration: 90,
                useNativeDriver: true,
            }),
            Animated.spring(pulse, {
                toValue: 1,
                speed: 20,
                bounciness: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, [summary, pulse]);

    // During loading or no data: render nothing — the header fills the void
    if (isLoading || !summary) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
            <StatPill
                icon={<Clock size={12} color={theme.colors.warning} />}
                label="Pendiente"
                value={`$${summary.open.remainingCop.toLocaleString()}`}
                count={summary.open.count}
                tone="warning"
            />

            <View style={styles.divider} />

            <StatPill
                icon={<CheckCircle size={12} color={theme.colors.success} />}
                label="Pagado"
                value={`$${summary.paid.amountCop.toLocaleString()}`}
                count={summary.paid.count}
                tone="success"
            />

            {summary.overdue.count > 0 && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.overduePill}>
                        <AlertCircle size={12} color={theme.colors.danger} />
                        <Text style={styles.overdueText}>{summary.overdue.count} vencidas</Text>
                    </View>
                </>
            )}
        </Animated.View>
    );
}

function StatPill({
    icon,
    label,
    value,
    count,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    count: number;
    tone: 'warning' | 'success';
}) {
    return (
        <View style={styles.pill}>
            <View style={styles.pillHeader}>
                {icon}
                <Text style={styles.pillLabel}>{label}</Text>
                <Text style={styles.pillCount}>({count})</Text>
            </View>
            <Text style={[styles.pillValue, tone === 'warning' ? styles.toneWarning : styles.toneSuccess]}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        gap: 0,
    },
    pill: {
        flex: 1,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
    },
    pillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    pillLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    pillCount: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    pillValue: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.semibold,
    },
    toneWarning: {
        color: theme.colors.warning,
    },
    toneSuccess: {
        color: theme.colors.success,
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: theme.colors.border,
        alignSelf: 'center',
    },
    overduePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: `${theme.colors.danger}18`,
    },
    overdueText: {
        fontSize: theme.font.xs,
        color: theme.colors.danger,
        fontWeight: theme.weight.semibold,
    },
});
