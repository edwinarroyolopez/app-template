// src/modules/payables/components/PayableCard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
} from 'lucide-react-native';
import { theme } from '@/theme';
import type { Payable } from '../types/payables.types';

type Props = {
    payable: Payable;
    onPress: () => void;
};

export default function PayableCard({ payable, onPress }: Props) {
    const isOverdue =
        payable.status === 'OPEN' && payable.dueDate && new Date(payable.dueDate) < new Date();
    const isPartial = payable.status === 'OPEN' && payable.paidCop > 0;

    const statusConfig = {
        OPEN: {
            color: isOverdue ? theme.colors.danger : theme.colors.warning,
            icon: isOverdue ? AlertCircle : Clock,
            label: isPartial ? 'Parcial' : isOverdue ? 'Vencida' : 'Pendiente',
        },
        PAID: {
            color: theme.colors.success,
            icon: CheckCircle,
            label: 'Pagada',
        },
        CANCELLED: {
            color: theme.colors.danger,
            icon: XCircle,
            label: 'Cancelada',
        },
    }[payable.status];

    const StatusIcon = statusConfig.icon;
    const accentLeft = statusConfig.color;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                { borderLeftColor: accentLeft },
                pressed && styles.pressed,
            ]}
        >
            {/* Row 1: título + estado */}
            <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={1}>{payable.title}</Text>
                <View style={styles.statusChip}>
                    <StatusIcon size={11} color={statusConfig.color} strokeWidth={2.5} />
                    <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* Row 2: proveedor + fecha */}
            <View style={styles.metaRow}>
                {payable.vendorName ? (
                    <Text style={styles.metaText} numberOfLines={1}>{payable.vendorName}</Text>
                ) : (
                    <Text style={styles.metaText}>—</Text>
                )}
                <Text style={styles.metaDate}>
                    {payable.dueDate
                        ? `Vence ${payable.dueDate.slice(0, 10)}`
                        : payable.date.slice(0, 10)}
                </Text>
            </View>

            {/* Row 3: montos */}
            <View style={styles.amountsRow}>
                <View style={styles.amountPrimary}>
                    <Text style={styles.amountPrimaryValue}>
                        ${payable.remainingCop.toLocaleString()}
                    </Text>
                    <Text style={styles.amountPrimaryLabel}>pendiente</Text>
                </View>
                <View style={styles.amountSecondary}>
                    <Text style={styles.amountSecondaryValue}>
                        ${payable.amountCop.toLocaleString()}
                    </Text>
                    <Text style={styles.amountSecondaryLabel}>total</Text>
                </View>
                {payable.paidCop > 0 && (
                    <View style={styles.amountSecondary}>
                        <Text style={[styles.amountSecondaryValue, styles.amountPaidValue]}>
                            ${payable.paidCop.toLocaleString()}
                        </Text>
                        <Text style={styles.amountSecondaryLabel}>pagado</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderLeftWidth: 3,
    },
    pressed: {
        opacity: 0.82,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    title: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusLabel: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.semibold,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    metaText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        flex: 1,
    },
    metaDate: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    amountsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.md,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    amountPrimary: {
        flex: 1,
    },
    amountPrimaryValue: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        lineHeight: 22,
    },
    amountPrimaryLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    amountSecondary: {
        alignItems: 'flex-end',
    },
    amountSecondaryValue: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textSecondary,
    },
    amountSecondaryLabel: {
        fontSize: 10,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    amountPaidValue: {
        color: theme.colors.success,
    },
});
