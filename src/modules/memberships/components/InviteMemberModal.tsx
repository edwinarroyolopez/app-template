// src/modules/memberships/components/InviteMemberModal.tsx
import {
    View,
    Text,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { UserPlus, Crown, Pickaxe, Lock, ArrowUp } from 'lucide-react-native';

import { useInviteMember } from '../hooks/useInviteMember';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { ActionLoader } from '@/components/ui/ActionLoader';
import Toast from 'react-native-toast-message';

import { Role } from '@/types/user';
import { useCanInviteWorkspaceMembers } from '@/selectors/useCanInviteWorkspaceMembers';
import { CapabilityGate } from '@/components/CapabilityGate/CapabilityGate';

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function InviteMemberModal({ visible, onClose }: Props) {
    const invite = useInviteMember();
    const inviteCapability = useCanInviteWorkspaceMembers();

    const [processing, setProcessing] = useState(false);
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [puestoCount, setPuestoCount] = useState('1');

    // 🔥 ahora soporta OWNER_VIEWER
    const [role, setRole] = useState<Role>(Role.OPERATOR);

    // 🔥 solo aplica si eliges socio: define si es admin o viewer
    const isOwnerSelected = role === Role.OWNER || role === Role.OWNER_VIEWER;

    async function submit() {
        if (!inviteCapability.enabled) return;
        if (!phone.trim() || !name.trim()) return;

        try {
            setProcessing(true);

            await invite.mutateAsync({
                phone,
                name,
                role,
                puestoCount: Number(puestoCount),
            });

            setPhone('');
            setName('');
            setPuestoCount('1');
            setRole(Role.OPERATOR);

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
                text1: 'Error al invitar miembro',
                text2: message,
            });
        }
    }

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                style={styles.flexOne}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <CapabilityGate
                            capability={inviteCapability}
                            mode="blur"
                            secondaryActionLabel="Cerrar"
                            onSecondaryPress={onClose}
                        >
                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* TITLE */}
                                <View style={styles.titleRow}>
                                    <UserPlus size={20} color={theme.colors.accent} />
                                    <Text style={styles.title}>
                                        Invitar miembro
                                    </Text>
                                </View>

                                <Text style={styles.subtitle}>
                                    Se enviará una invitación por WhatsApp
                                </Text>

                                {/* TELÉFONO */}
                                <Label text="Teléfono" />
                                <Input
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="3006453020"
                                    keyboardType="phone-pad"
                                />

                                {/* NOMBRE */}
                                <Label text="Nombre" />
                                <Input value={name} onChangeText={setName} placeholder="Nombre" />

                                {/* ROL */}
                                <Label text="Rol en la negocio" />
                                <View style={styles.roleRow}>
                                    <RoleButton
                                        selected={role === Role.OPERATOR}
                                        onPress={() => setRole(Role.OPERATOR)}
                                        label="Operador"
                                        icon={Pickaxe}
                                    />
                                    <RoleButton
                                        selected={isOwnerSelected}
                                        onPress={() => setRole(Role.OWNER)}
                                        label="Socio"
                                        icon={Crown}
                                    />
                                </View>

                                {/* 🔒 SUB-OPCIÓN PARA SOCIO */}
                                {isOwnerSelected && (
                                    <>
                                        <Label text="Permisos del socio" />
                                        <View style={styles.roleRow}>
                                            <RoleButton
                                                selected={role === Role.OWNER}
                                                onPress={() => setRole(Role.OWNER)}
                                                label="Admin (puede editar)"
                                                icon={Crown}
                                            />
                                            <RoleButton
                                                selected={role === Role.OWNER_VIEWER}
                                                onPress={() => setRole(Role.OWNER_VIEWER)}
                                                label="Solo ver"
                                                icon={Lock}
                                            />
                                        </View>

                                        <Text
                                            style={styles.ownerNote}
                                        >
                                            El socio “Solo ver” podrá entrar y ver todo, pero no podrá modificar configuraciones ni registrar cambios.
                                        </Text>
                                    </>
                                )}

                                {/* PUESTOS */}
                                <Label text="Puestos" />
                                <Input
                                    value={puestoCount}
                                    onChangeText={setPuestoCount}
                                    keyboardType="numeric"
                                    placeholder="Ej: 1"
                                />

                                {/* ACTIONS */}
                                <View style={styles.actionsRow}>
                                    <Pressable onPress={onClose} style={({ pressed }) => pressed && styles.pressed}>
                                        <Text style={styles.cancelText}>Cancelar</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={submit}
                                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                                    >
                                        <Text style={styles.primaryText}>
                                            Enviar invitación
                                        </Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </CapabilityGate>
                    </View>
                </View>

                <ActionLoader
                    visible={processing}
                    steps={[
                        'Validando datos…',
                        'Generando invitación…',
                        'Asignando rol…',
                        'Registrando miembro…',
                        'Finalizando…',
                    ]}
                />
            </KeyboardAvoidingView>

            <Toast />
        </Modal>
    );
}

/* UI helpers */

function Label({ text }: { text: string }) {
    return (
        <Text style={styles.label}>
            {text}
        </Text>
    );
}

function RoleButton({ selected, onPress, label, icon: Icon }: any) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.roleButton,
                selected ? styles.roleButtonActive : styles.roleButtonIdle,
                pressed && styles.pressed,
            ]}
        >
            <Icon
                size={16}
                color={selected ? theme.colors.background : theme.colors.textMuted}
            />
            {selected && <ArrowUp size={12} color={theme.colors.background} />}
            <Text
                style={selected ? styles.roleTextActive : styles.roleTextIdle}
            >
                {label}
            </Text>
        </Pressable>
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
    subtitle: {
        marginTop: theme.spacing.xs,
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    label: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs,
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    roleRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    ownerNote: {
        marginTop: theme.spacing.xs,
        color: theme.colors.textMuted,
        fontSize: theme.font.xs,
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
    primaryText: {
        fontWeight: theme.weight.bold,
        color: theme.colors.background,
    },
    roleButton: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        borderWidth: 1,
    },
    roleButtonActive: {
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.accent,
    },
    roleButtonIdle: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceSoft,
    },
    roleTextActive: {
        fontWeight: theme.weight.bold,
        color: theme.colors.background,
        textAlign: 'center',
        fontSize: theme.font.sm,
    },
    roleTextIdle: {
        fontWeight: theme.weight.medium,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        fontSize: theme.font.sm,
    },
    pressed: {
        opacity: 0.86,
    },
});
