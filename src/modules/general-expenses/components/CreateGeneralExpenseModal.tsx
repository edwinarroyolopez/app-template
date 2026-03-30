// src/modules/general-expenses/components/CreateGeneralExpenseModal.tsx
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
import { Edit3, Plus, Brain, Calendar, Store } from 'lucide-react-native';

import { ImageAttachmentField } from '@/components/ui/ImageAttachmentField';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useCreateGeneralExpense } from '../hooks/useCreateGeneralExpense';
import { useUpdateGeneralExpense } from '../hooks/useUpdateGeneralExpense';
import { useTranscribeGeneralExpense } from '../hooks/useTranscribeGeneralExpense';

import Toast from 'react-native-toast-message';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { FeedbackModal } from '@/components/FeedbackModal/FeedbackModal';
import { useCanAskFeedback } from '@/hooks/useCanAskFeedback';

import { EXPENSE_CATEGORIES } from '../utils/generalExpenseForm.constants';
import {
    formatMoneyInput,
    cleanMoney,
    formatDate,
    formatDateReadable,
} from '../utils/generalExpenseForm.helpers';

/* ===== TYPES ===== */

type Props = {
    visible: boolean;
    onClose: () => void;
    initialData?: {
        _id?: string;
        amountCop?: number;
        description?: string;
        confidence?: number;
        isPayable?: boolean;
        vendorName?: string;
        category?: string;
        date?: string;
    };
};

/* ===== COMPONENT ===== */

export default function CreateGeneralExpenseModal({
    visible,
    onClose,
    initialData,
}: Props) {
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const isEdit = !!initialData?._id;

    const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [receiptImage, setReceiptImage] = useState<any>(null);
    const [isPayable, setIsPayable] = useState(false);
    const [vendorName, setVendorName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const createGeneralExpense = useCreateGeneralExpense();
    const updateGeneralExpense = useUpdateGeneralExpense();
    const transcribe = useTranscribeGeneralExpense();

    /* ===== PREFILL ===== */
    useEffect(() => {
        if (!visible) return;

        setShowPicker(false);
        setReceiptImage(null);
        setProcessing(false);
        setCategory(EXPENSE_CATEGORIES[0]);
        setAmount('');
        setDescription('');
        setIsPayable(false);
        setVendorName('');
        setDate(new Date());

        if (!initialData) return;

        if (initialData.amountCop) setAmount(formatMoneyInput(String(initialData.amountCop)));
        if (initialData.description) setDescription(initialData.description);
        if (typeof initialData.isPayable === 'boolean') setIsPayable(initialData.isPayable);
        if (initialData.vendorName) setVendorName(initialData.vendorName);
        if (initialData.category) setCategory(initialData.category);
        if (initialData.date) {
            const parsed = new Date(initialData.date);
            if (!Number.isNaN(parsed.getTime())) setDate(parsed);
        }
    }, [visible, initialData]);

    const { data: canAsk } = useCanAskFeedback('CREATE_OPERATIONAL_COST');

    const handleAmountChange = useCallback((v: string) => setAmount(formatMoneyInput(v)), []);
    const handleSetPayable = useCallback((v: boolean) => () => setIsPayable(v), []);
    const handleOpenPicker = useCallback(() => setShowPicker(true), []);

    async function submit() {
        const amountNumber = cleanMoney(amount);
        if (!amountNumber || processing) return;

        if (isPayable && !vendorName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Falta el proveedor',
                text2: 'Si quedó pendiente, escribe quién lo fió.',
            });
            return;
        }

        try {
            setProcessing(true);

            if (isEdit) {
                await updateGeneralExpense.mutateAsync({
                    costId: initialData?._id || '',
                    payload: {
                        category,
                        date: formatDate(date),
                        amountCop: amountNumber,
                        description,
                        isPayable,
                        vendorName: vendorName.trim() || undefined,
                    },
                    image: receiptImage,
                });
            } else {
                await createGeneralExpense.mutateAsync({
                    category,
                    date: formatDate(date),
                    amountCop: amountNumber,
                    description,
                    image: receiptImage,
                    isPayable,
                    vendorName: vendorName.trim() || undefined,
                });
            }

            setProcessing(false);
            setAmount('');
            setDescription('');
            setReceiptImage(null);
            setIsPayable(false);
            setVendorName('');
            onClose();

            if (canAsk?.canAsk) setShowFeedback(true);
        } catch (err: any) {
            setProcessing(false);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Error desconocido';

            Toast.show({
                type: 'error',
                text1: 'Error al guardar gasto',
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
                                        {isEdit ? 'Editar gasto' : 'Registrar gasto'}
                                    </Text>
                                </View>

                                {/* ── AI CONFIDENCE ── */}
                                {!!initialData?.confidence && (
                                    <View style={styles.confidenceBox}>
                                        <Brain size={14} color={theme.colors.textSecondary} />
                                        <Text style={styles.confidenceText}>
                                            Datos sugeridos por audio ·{' '}
                                            <Text style={styles.confidenceBold}>
                                                {Math.round(initialData.confidence * 100)}%
                                            </Text>
                                        </Text>
                                    </View>
                                )}

                                {/* ══ 1. MONTO ══ */}
                                <SectionLabel text="Monto (COP)" />
                                <Input
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    style={styles.amountInput}
                                />

                                {/* ══ 2. CONDICIÓN DE PAGO ══ */}
                                <SectionLabel text="Condición de pago" />
                                <View style={styles.chipRow}>
                                    <PaymentChip
                                        label="Pagado"
                                        active={!isPayable}
                                        onPress={handleSetPayable(false)}
                                        activeColor={theme.colors.success}
                                    />
                                    <PaymentChip
                                        label="Pendiente"
                                        active={isPayable}
                                        onPress={handleSetPayable(true)}
                                        activeColor={theme.colors.warning}
                                    />
                                </View>

                                {/* ── Proveedor (solo si pendiente) ── */}
                                {isPayable && (
                                    <View style={styles.vendorBlock}>
                                        <View style={styles.vendorLabelRow}>
                                            <Store size={13} color={theme.colors.textMuted} />
                                            <Text style={styles.vendorLabel}>Proveedor</Text>
                                        </View>
                                        <Input
                                            value={vendorName}
                                            onChangeText={setVendorName}
                                            placeholder="Quién lo fió (ej: Almacén Central)"
                                        />
                                        <Text style={styles.vendorHint}>
                                            Se creará una cuenta por pagar automáticamente.
                                        </Text>
                                    </View>
                                )}

                                {/* ══ 3. CATEGORÍA ══ */}
                                <SectionLabel text="Categoría" />
                                <View style={styles.categoryRow}>
                                    {EXPENSE_CATEGORIES.map((c) => {
                                        const selected = category === c;
                                        return (
                                            <Pressable
                                                key={c}
                                                onPress={() => setCategory(c)}
                                                style={[
                                                    styles.categoryChip,
                                                    selected ? styles.categoryChipActive : styles.categoryChipIdle,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.categoryChipText,
                                                        selected
                                                            ? styles.categoryChipTextActive
                                                            : styles.categoryChipTextIdle,
                                                    ]}
                                                >
                                                    {c}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                {/* ══ 4. NOTA ══ */}
                                <SectionLabel text="Nota (opcional)" />
                                <Input
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    placeholder="¿Algo que quieras recordar sobre este gasto?"
                                    style={styles.noteInput}
                                />

                                {/* ══ 5. FECHA ══ */}
                                <Pressable onPress={handleOpenPicker} style={styles.datePill}>
                                    <Calendar size={13} color={theme.colors.textMuted} />
                                    <Text style={styles.datePillText}>{formatDateReadable(date)}</Text>
                                </Pressable>

                                {showPicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(_, d) => {
                                            setShowPicker(false);
                                            if (d) setDate(d);
                                        }}
                                    />
                                )}

                                {/* ══ 6. FACTURA OPCIONAL ══ */}
                                <ImageAttachmentField
                                    title="Factura (opcional)"
                                    helperText="Adjunta evidencia del gasto."
                                    images={receiptImage ? [receiptImage] : []}
                                    onChange={(next) => setReceiptImage(next[0] || null)}
                                    maxImages={1}
                                />

                                {/* ── Audio ── */}
                                {transcribe.isPending && (
                                    <View style={styles.audioBox}>
                                        <Text style={styles.audioText}>Interpretando audio…</Text>
                                    </View>
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

                    <ActionLoader
                        visible={processing}
                        steps={[
                            'Validando información…',
                            'Subiendo comprobante…',
                            'Registrando gasto…',
                            isPayable ? 'Creando cuenta por pagar…' : 'Actualizando balances…',
                            'Finalizando…',
                        ]}
                    />
                </KeyboardAvoidingView>

                <Toast />
            </Modal>

            <FeedbackModal
                visible={showFeedback}
                feature="CREATE_OPERATIONAL_COST"
                onClose={() => setShowFeedback(false)}
            />
        </>
    );
}

/* ===== SUB-COMPONENTS ===== */

function SectionLabel({ text }: { text: string }) {
    return (
        <Text style={styles.sectionLabel}>{text}</Text>
    );
}

type PaymentChipProps = {
    label: string;
    active: boolean;
    onPress: () => void;
    activeColor: string;
};

function PaymentChip({ label, active, onPress, activeColor }: PaymentChipProps) {
    const chipStyle = {
        ...styles.paymentChip,
        borderColor: active ? activeColor : theme.colors.border,
        backgroundColor: active ? `${activeColor}33` : theme.colors.surfaceSoft,
    };
    const textStyle = {
        ...styles.paymentChipText,
        fontWeight: active ? theme.weight.bold : theme.weight.regular,
        color: active ? activeColor : theme.colors.textMuted,
    } as const;

    return (
        <Pressable onPress={onPress} style={chipStyle}>
            <Text style={textStyle}>{label}</Text>
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

    /* ai confidence */
    confidenceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceSoft,
    },
    confidenceText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    confidenceBold: {
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

    /* payment chips */
    chipRow: {
        flexDirection: 'row',
        gap: 10,
    },
    paymentChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    paymentChipText: {
        fontSize: theme.font.md,
    },

    /* vendor */
    vendorBlock: { gap: 6 },
    vendorLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    vendorLabel: {
        fontSize: theme.font.sm,
        color: theme.colors.textSecondary,
    },
    vendorHint: {
        fontSize: 11,
        color: theme.colors.textMuted,
        lineHeight: 15,
    },

    /* category chips */
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryChipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    categoryChipIdle: {
        backgroundColor: theme.colors.surfaceSoft,
        borderColor: theme.colors.border,
    },
    categoryChipText: {
        fontSize: theme.font.sm,
    },
    categoryChipTextActive: {
        color: '#000',
        fontWeight: theme.weight.semibold,
    },
    categoryChipTextIdle: {
        color: theme.colors.textSecondary,
        fontWeight: theme.weight.regular,
    },

    /* nota */
    noteInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },

    /* fecha */
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
        marginTop: 4,
    },
    datePillText: {
        fontSize: theme.font.sm,
        color: theme.colors.textSecondary,
    },

    /* audio */
    audioBox: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceSoft,
    },
    audioText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
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
