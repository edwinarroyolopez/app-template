// src/modules/memberships/components/EditMembershipModal.tsx
import { View, Text, Modal, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { BadgeCheck, CheckCircle, AlertCircle } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useUpdateMembership } from '../hooks/useUpdateMembership';

type Props = {
    visible: boolean;
    membership: any;
    onClose: () => void;
};

export default function EditMembershipModal({
    visible,
    membership,
    onClose,
}: Props) {
    const update = useUpdateMembership();

    const [puestoCount, setPuestoCount] = useState('1');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (membership) {
            setPuestoCount(String(membership.puestoCount ?? 1));
            setIsActive(membership.isActive);
        }
    }, [membership]);

    function submit() {
        if (!membership || update.isPending) return;

        update.mutate(
            {
                membershipId: membership.id,
                data: {
                    puestoCount: Number(puestoCount),
                    isActive,
                },
            },
            { onSuccess: onClose },
        );
    }

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                style={styles.flexOne}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.titleRow}>
                                <BadgeCheck size={18} color={theme.colors.accent} />
                                <Text style={styles.title}>Editar miembro</Text>
                            </View>

                            <View style={styles.readonlyCard}>
                                <InfoRow label="Nombre" value={membership?.user?.name || 'Sin nombre'} />
                                <InfoRow label="Teléfono" value={membership?.user?.phone || 'No definido'} />
                                <InfoRow label="Rol" value={membership?.role || 'SIN ROL'} />
                            </View>

                            {/* PUESTOS */}
                            <Label text="Puestos" />
                            <Input
                                value={puestoCount}
                                onChangeText={setPuestoCount}
                                keyboardType="numeric"
                            />

                            {/* ACTIVO */}
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>
                                    Miembro activo
                                </Text>

                                <View style={styles.switchWrap}>
                                    {isActive ? (
                                        <CheckCircle size={12} color={theme.colors.success} />
                                    ) : (
                                        <AlertCircle size={12} color={theme.colors.textMuted} />
                                    )}
                                    <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                                        {isActive ? 'Activo' : 'Inactivo'}
                                    </Text>
                                    <Switch
                                        value={isActive}
                                        onValueChange={setIsActive}
                                        trackColor={{ false: theme.colors.surfaceSoft, true: `${theme.colors.success}66` }}
                                        thumbColor={isActive ? theme.colors.success : theme.colors.textMuted}
                                    />
                                </View>
                            </View>

                            {/* ACTIONS */}
                            <View style={styles.actionsRow}>
                                <Pressable onPress={onClose} style={({ pressed }) => pressed && styles.pressed}>
                                    <Text style={styles.cancelText}>
                                        Cancelar
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={submit}
                                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        Guardar
                                    </Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

function Label({ text }: { text: string }) {
    return (
        <Text style={styles.label}>
            {text}
        </Text>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    flexOne: { flex: 1 },
    overlay: {
        flex: 1,
        backgroundColor: `${theme.colors.background}AA`,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    title: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    label: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    readonlyCard: {
        marginTop: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceSoft,
        padding: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    infoLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.font.xs,
    },
    infoValue: {
        flex: 1,
        textAlign: 'right',
        color: theme.colors.textPrimary,
        fontSize: theme.font.sm,
        fontWeight: theme.weight.semibold,
    },
    statusRow: {
        marginTop: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
    },
    statusPillActive: {
        backgroundColor: `${theme.colors.success}22`,
        borderColor: `${theme.colors.success}66`,
    },
    statusPillInactive: {
        backgroundColor: theme.colors.surfaceSoft,
        borderColor: theme.colors.border,
    },
    statusText: {
        fontWeight: theme.weight.bold,
        fontSize: theme.font.xs,
    },
    statusTextActive: {
        color: theme.colors.success,
    },
    statusTextInactive: {
        color: theme.colors.textMuted,
    },
    switchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
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
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
    },
    primaryButtonText: {
        color: theme.colors.background,
        fontWeight: theme.weight.bold,
    },
    pressed: {
        opacity: 0.86,
    },
});
