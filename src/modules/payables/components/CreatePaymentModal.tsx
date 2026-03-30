// src/modules/payables/components/CreatePaymentModal.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    Platform,
    StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DollarSign } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { theme } from '@/theme';
import { useCreatePayment } from '../hooks/useCreatePayment';
import type { PaymentMethod } from '../types/payments.types';

/* ===== Money formatting helpers ===== */
function formatMoneyInput(value: string) {
    const numeric = value.replace(/\D/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function cleanMoney(value: string) {
    return Number(value.replace(/\D/g, '')) || 0;
}

/* ===== Date formatting ===== */
function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'CARD', label: 'Tarjeta' },
    { value: 'OTHER', label: 'Otro' },
];

type Props = {
    visible: boolean;
    onClose: () => void;
    payableId: string;
    remainingAmount: number;
};

export default function CreatePaymentModal({
    visible,
    onClose,
    payableId,
    remainingAmount,
}: Props) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [method, setMethod] = useState<PaymentMethod>('CASH');
    const [notes, setNotes] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [processing, setProcessing] = useState(false);

    const createPayment = useCreatePayment(payableId);

    /* ===== Reset on modal open ===== */
    useEffect(() => {
        if (!visible) return;

        setAmount('');
        setDate(new Date());
        setMethod('CASH');
        setNotes('');
        setProcessing(false);
    }, [visible]);

    async function submit() {
        if (processing) return;

        const amountNumber = cleanMoney(amount);

        if (amountNumber <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Monto inválido',
                text2: 'El monto debe ser mayor a 0.',
            });
            return;
        }

        // Warning if exceeding remaining (but allow it)
        if (amountNumber > remainingAmount) {
            Toast.show({
                type: 'info',
                text1: 'Monto mayor al pendiente',
                text2: `El saldo pendiente es $${remainingAmount.toLocaleString()}. Se registrará el pago igualmente.`,
            });
        }

        try {
            setProcessing(true);

            await createPayment.mutateAsync({
                amountCop: amountNumber,
                date: formatDate(date),
                method,
                notes: notes.trim() || undefined,
            });

            Toast.show({
                type: 'success',
                text1: 'Pago registrado',
            });

            setProcessing(false);
            onClose();
        } catch (err: any) {
            setProcessing(false);
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Error desconocido';

            Toast.show({
                type: 'error',
                text1: 'Error al registrar pago',
                text2: message,
            });
        }
    }

    return (
        <OperationalModal
            visible={visible}
            onClose={onClose}
            title="Registrar pago"
            contentContainerStyle={styles.scrollContent}
            footer={
                <View style={styles.actionsRow}>
                    <Pressable onPress={onClose} style={({ pressed }) => pressed && styles.pressed}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </Pressable>

                    <Pressable
                        onPress={submit}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            processing && styles.disabled,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>
                            {processing ? 'Guardando…' : 'Registrar pago'}
                        </Text>
                    </Pressable>
                </View>
            }
        >
            <View style={styles.titleRow}>
                <DollarSign size={20} color={theme.colors.accent} />
                <Text style={styles.titleText}>
                    Registrar pago
                </Text>
            </View>

            <View style={styles.remainingCard}>
                <Text style={styles.remainingLabel}>
                    Saldo pendiente
                </Text>
                <Text style={styles.remainingValue}>
                    ${remainingAmount.toLocaleString()}
                </Text>
            </View>

            <Label text="Monto del pago (COP) *" />
            <Input
                value={amount}
                onChangeText={(v) => setAmount(formatMoneyInput(v))}
                keyboardType="numeric"
                placeholder="Ej: 100.000"
            />

            <Label text="Fecha del pago *" />
            <Pressable onPress={() => setShowDatePicker(true)}>
                <Input value={formatDate(date)} editable={false} />
            </Pressable>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, d) => {
                        setShowDatePicker(false);
                        if (d) setDate(d);
                    }}
                />
            )}

            <Label text="Método de pago" />
            <View style={styles.methodsWrap}>
                {PAYMENT_METHODS.map((m) => {
                    const selected = method === m.value;
                    return (
                        <Pressable
                            key={m.value}
                            onPress={() => setMethod(m.value)}
                            style={({ pressed }) => [
                                styles.methodChip,
                                selected ? styles.methodChipActive : styles.methodChipIdle,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={selected ? styles.methodChipTextActive : styles.methodChipTextIdle}>
                                {m.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <Label text="Notas" />
            <Input
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Observaciones sobre el pago (opcional)"
            />
        </OperationalModal>
    );
}

/* ===== HELPER ===== */
function Label({ text }: { text: string }) {
    return (
        <Text
            style={{
                marginTop: theme.spacing.md,
                fontSize: theme.font.sm,
                color: theme.colors.textSecondary,
            }}
        >
            {text}
        </Text>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        gap: theme.spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    titleText: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    remainingCard: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: `${theme.colors.warning}22`,
        borderWidth: 1,
        borderColor: `${theme.colors.warning}66`,
    },
    remainingLabel: {
        fontSize: theme.font.xs,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    remainingValue: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
        color: theme.colors.warning,
    },
    methodsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
    },
    methodChip: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
    },
    methodChipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    methodChipIdle: {
        backgroundColor: theme.colors.surfaceSoft,
        borderColor: theme.colors.border,
    },
    methodChipTextActive: {
        color: theme.colors.background,
        fontWeight: theme.weight.bold,
    },
    methodChipTextIdle: {
        color: theme.colors.textPrimary,
        fontWeight: theme.weight.medium,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.lg,
    },
    cancelText: {
        color: theme.colors.textMuted,
    },
    primaryButton: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
    },
    primaryButtonText: {
        fontWeight: theme.weight.bold,
        color: theme.colors.background,
    },
    disabled: {
        opacity: 0.6,
    },
    pressed: {
        opacity: 0.86,
    },
});
