// src/modules/payables/components/PaymentCard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
    Calendar,
    Trash2,
    CreditCard,
    Banknote,
    Wallet as WalletIcon,
    Coins,
} from 'lucide-react-native';
import { theme } from '@/theme';
import type { Payment } from '../types/payments.types';

type Props = {
    payment: Payment;
    onDelete?: () => void;
};

export default function PaymentCard({ payment, onDelete }: Props) {
    const methodConfig = {
        CASH: { icon: Banknote, label: 'Efectivo' },
        TRANSFER: { icon: WalletIcon, label: 'Transferencia' },
        CARD: { icon: CreditCard, label: 'Tarjeta' },
        OTHER: { icon: CreditCard, label: 'Otro' },
    }[payment.method];

    const MethodIcon = methodConfig.icon;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <MethodIcon size={16} color={theme.colors.accent} />
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.row}>
                        <View style={styles.amountRow}>
                            <Coins size={12} color={theme.colors.accent} />
                            <Text style={styles.amount}>${payment.amountCop.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.method}>{methodConfig.label}</Text>
                    </View>

                    <View style={styles.dateRow}>
                        <Calendar size={12} color={theme.colors.textMuted} />
                        <Text style={styles.date}>{payment.date.slice(0, 10)}</Text>
                    </View>

                    {payment.notes && (
                        <Text style={styles.notes} numberOfLines={2}>
                            {payment.notes}
                        </Text>
                    )}
                </View>

                {onDelete && (
                    <Pressable onPress={onDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                        <Trash2 size={16} color={theme.colors.danger} />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    infoSection: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    amount: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    method: {
        fontSize: theme.font.xs,
        color: theme.colors.textSecondary,
        fontWeight: theme.weight.semibold,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    date: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    notes: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${theme.colors.danger}22`,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing.sm,
        borderWidth: 1,
        borderColor: `${theme.colors.danger}44`,
    },
    pressed: {
        opacity: 0.8,
    },
});
