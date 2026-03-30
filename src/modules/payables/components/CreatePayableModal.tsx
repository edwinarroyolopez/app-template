// src/modules/payables/components/CreatePayableModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Edit3, Calendar, Store } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useCreatePayable } from '../hooks/useCreatePayable';
import { useUpdatePayable } from '../hooks/useUpdatePayable';
import type { Payable } from '../types/payables.types';

/* ===== Helpers ===== */

function formatMoneyInput(value: string): string {
    const numeric = value.replace(/\D/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function cleanMoney(value: string): number {
    return Number(value.replace(/\D/g, '')) || 0;
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDateReadable(date: Date): string {
    return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/* ===== Types ===== */

type Props = {
    visible: boolean;
    onClose: () => void;
    initialData?: Payable;
};

/* ===== Component ===== */

export default function CreatePayableModal({ visible, onClose, initialData }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [hasDueDate, setHasDueDate] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [processing, setProcessing] = useState(false);

    const isEdit = !!initialData?._id;

    const createPayable = useCreatePayable();
    const updatePayable = useUpdatePayable(initialData?._id || '');

    /* ===== Prefill ===== */
    useEffect(() => {
        if (!visible) return;

        setTitle('');
        setDescription('');
        setVendorName('');
        setAmount('');
        setDate(new Date());
        setDueDate(undefined);
        setHasDueDate(false);
        setProcessing(false);

        if (!initialData) return;

        if (initialData.title) setTitle(initialData.title);
        if (initialData.description) setDescription(initialData.description);
        if (initialData.vendorName) setVendorName(initialData.vendorName);
        if (initialData.amountCop) setAmount(formatMoneyInput(String(initialData.amountCop)));
        if (initialData.date) {
            const d = new Date(initialData.date);
            if (!Number.isNaN(d.getTime())) setDate(d);
        }
        if (initialData.dueDate) {
            const dd = new Date(initialData.dueDate);
            if (!Number.isNaN(dd.getTime())) {
                setDueDate(dd);
                setHasDueDate(true);
            }
        }
    }, [visible, initialData]);

    const handleAmountChange = useCallback((v: string) => setAmount(formatMoneyInput(v)), []);
    const handleOpenDatePicker = useCallback(() => setShowDatePicker(true), []);
    const handleOpenDueDatePicker = useCallback(() => setShowDueDatePicker(true), []);
    const handleToggleDueDate = useCallback(() => setHasDueDate((prev) => !prev), []);

    async function submit() {
        if (processing) return;

        const amountNumber = cleanMoney(amount);

        if (!title.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Falta el concepto',
                text2: 'Escribe a qué corresponde esta cuenta.',
            });
            return;
        }

        if (amountNumber <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Monto inválido',
                text2: 'El monto debe ser mayor a 0.',
            });
            return;
        }

        try {
            setProcessing(true);

            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                vendorName: vendorName.trim() || undefined,
                amountCop: amountNumber,
                date: formatDate(date),
                dueDate: hasDueDate && dueDate ? formatDate(dueDate) : undefined,
            };

            if (isEdit) {
                await updatePayable.mutateAsync(payload);
                Toast.show({ type: 'success', text1: 'Cuenta actualizada' });
            } else {
                await createPayable.mutateAsync(payload);
                Toast.show({ type: 'success', text1: 'Cuenta registrada' });
            }

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
                text1: isEdit ? 'Error al actualizar' : 'Error al crear',
                text2: message,
            });
        }
    }

    return (
        <>
            <Modal visible={visible} transparent animationType="slide">
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.overlay}>
                        <View style={styles.sheet}>
                            <ScrollView
                                contentContainerStyle={styles.scroll}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* ── TITLE ── */}
                                <View style={styles.titleRow}>
                                    {isEdit
                                        ? <Edit3 size={18} color={theme.colors.accent} />
                                        : <Plus size={18} color={theme.colors.accent} />}
                                    <Text style={styles.titleText}>
                                        {isEdit ? 'Editar cuenta' : 'Nueva cuenta por pagar'}
                                    </Text>
                                </View>

                                {/* ══ 1. MONTO ══ */}
                                <SectionLabel text="Monto (COP)" />
                                <Input
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    style={styles.amountInput}
                                />

                                {/* ══ 2. CONCEPTO ══ */}
                                <SectionLabel text="Concepto" />
                                <Input
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="A qué corresponde (ej: Repuestos motor)"
                                />

                                {/* ══ 3. PROVEEDOR ══ */}
                                <View style={styles.vendorLabelRow}>
                                    <Store size={13} color={theme.colors.textMuted} />
                                    <Text style={styles.vendorLabel}>Proveedor (opcional)</Text>
                                </View>
                                <Input
                                    value={vendorName}
                                    onChangeText={setVendorName}
                                    placeholder="Nombre del proveedor"
                                />

                                {/* ══ 4. VENCIMIENTO ══ */}
                                <SectionLabel text="Vencimiento" />
                                <View style={styles.chipRow}>
                                    <DueDateChip
                                        label="Sin fecha"
                                        active={!hasDueDate}
                                        onPress={hasDueDate ? handleToggleDueDate : undefined}
                                    />
                                    <DueDateChip
                                        label="Con fecha"
                                        active={hasDueDate}
                                        onPress={!hasDueDate ? handleToggleDueDate : undefined}
                                    />
                                </View>

                                {hasDueDate && (
                                    <Pressable onPress={handleOpenDueDatePicker} style={styles.datePill}>
                                        <Calendar size={13} color={theme.colors.textMuted} />
                                        <Text style={styles.datePillText}>
                                            {dueDate ? formatDateReadable(dueDate) : 'Seleccionar fecha'}
                                        </Text>
                                    </Pressable>
                                )}

                                {showDueDatePicker && (
                                    <DateTimePicker
                                        value={dueDate || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(_, d) => {
                                            setShowDueDatePicker(false);
                                            if (d) setDueDate(d);
                                        }}
                                    />
                                )}

                                {/* ══ 5. NOTA ══ */}
                                <SectionLabel text="Nota (opcional)" />
                                <Input
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    placeholder="¿Algo que quieras recordar?"
                                    style={styles.noteInput}
                                />

                                {/* ══ 6. FECHA DE REGISTRO ══ */}
                                <Pressable onPress={handleOpenDatePicker} style={styles.datePill}>
                                    <Calendar size={13} color={theme.colors.textMuted} />
                                    <Text style={styles.datePillText}>{formatDateReadable(date)}</Text>
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

                                {/* ══ ACTIONS ══ */}
                                <View style={styles.actionsRow}>
                                    <Pressable onPress={onClose} style={styles.cancelBtn}>
                                        <Text style={styles.cancelText}>Cancelar</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={submit}
                                        style={[styles.submitBtn, processing && styles.submitBtnDisabled]}
                                    >
                                        <Text style={styles.submitText}>
                                            {processing ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>

                <Toast />
            </Modal>
        </>
    );
}

/* ===== SUB-COMPONENTS ===== */

function SectionLabel({ text }: { text: string }) {
    return <Text style={styles.sectionLabel}>{text}</Text>;
}

type DueDateChipProps = {
    label: string;
    active: boolean;
    onPress?: () => void;
};

function DueDateChip({ label, active, onPress }: DueDateChipProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.dueDateChip,
                active ? styles.dueDateChipActive : styles.dueDateChipIdle,
            ]}
        >
            <Text style={[
                styles.dueDateChipText,
                active ? styles.dueDateChipTextActive : styles.dueDateChipTextIdle,
            ]}>
                {label}
            </Text>
        </Pressable>
    );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
    flex: { flex: 1 },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        maxHeight: '92%',
    },
    scroll: {
        padding: theme.spacing.lg,
        paddingBottom: 40,
        gap: theme.spacing.sm,
    },

    /* title */
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    titleText: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },

    /* section label */
    sectionLabel: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: theme.spacing.xs,
    },

    /* monto */
    amountInput: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
    },

    /* vendor */
    vendorLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: theme.spacing.xs,
    },
    vendorLabel: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    /* due date chips */
    chipRow: {
        flexDirection: 'row',
        gap: 10,
    },
    dueDateChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    dueDateChipActive: {
        borderColor: theme.colors.accent,
        backgroundColor: `${theme.colors.accent}33`,
    },
    dueDateChipIdle: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceSoft,
    },
    dueDateChipText: {
        fontSize: theme.font.md,
    },
    dueDateChipTextActive: {
        fontWeight: theme.weight.bold,
        color: theme.colors.accent,
    },
    dueDateChipTextIdle: {
        fontWeight: theme.weight.regular,
        color: theme.colors.textMuted,
    },

    /* fecha pill */
    datePill: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surfaceSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    datePillText: {
        fontSize: theme.font.sm,
        color: theme.colors.textSecondary,
    },

    /* nota */
    noteInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },

    /* actions */
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: theme.spacing.md,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    cancelText: {
        color: theme.colors.textMuted,
        fontWeight: theme.weight.medium,
        fontSize: theme.font.md,
    },
    submitBtn: {
        flex: 2,
        paddingVertical: 13,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitText: {
        fontWeight: theme.weight.bold,
        color: '#000',
        fontSize: theme.font.md,
    },
});
