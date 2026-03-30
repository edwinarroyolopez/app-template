// quarantine/legacy-domain/modules/workspace-directory/components/CreateBusinessForm.tsx
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Animated,
} from 'react-native';
import { useState, useRef } from 'react';
import {
    Briefcase,
    Hash,
    CheckCircle,
} from 'lucide-react-native';

import { useCreateBusiness } from '../hooks/useCreateBusiness';
import { Input } from '@/components/ui/Input';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { theme } from '@/theme';
import type { WorkspaceOperationalType } from '@/types/workspace-operational';

const WORKSPACE_OPERATIONAL_TYPE_OPTIONS: Array<{ value: WorkspaceOperationalType; label: string }> = [
    { value: 'STORE', label: 'Tienda' },
    { value: 'WAREHOUSE', label: 'Bodega' },
    { value: 'WAREHOUSE_WITH_FACTORY', label: 'Bodega + Fabrica' },
    { value: 'NIGHTCLUB', label: 'Discoteca' },
    { value: 'GARMENT_WORKSHOP', label: 'Taller de confecciones' },
];

type Props = {
    onSuccess: () => void;
};

export default function CreateBusinessForm({ onSuccess }: Props) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [employee, setEmployee] = useState('');
    const [type, setType] = useState<WorkspaceOperationalType>('STORE');
    const [nameError, setNameError] = useState(false);
    const [processing, setProcessing] = useState(false);

    const btnScale = useRef(new Animated.Value(1)).current;
    const createBusiness = useCreateBusiness();

    function animateBtn(toValue: number) {
        Animated.spring(btnScale, {
            toValue,
            useNativeDriver: true,
            speed: 30,
            bounciness: 4,
        }).start();
    }

    async function submit() {
        if (!name.trim()) {
            setNameError(true);
            return;
        }
        setNameError(false);
        if (processing) return;

        try {
            setProcessing(true);
            await createBusiness.mutateAsync({
                name,
                type,
                address: address.trim() || undefined,
                phone: phone.trim() || undefined,
                employee: employee.trim() || undefined,
            });
            setProcessing(false);
            onSuccess();
        } catch {
            setProcessing(false);
        }
    }

    const isPending = processing;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ===== HEADER ===== */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Briefcase
                            size={18}
                            color={theme.colors.accent}
                            strokeWidth={2}
                        />
                    </View>
                    <View>
                        <Text style={styles.title}>Crear workspace</Text>
                        <Text style={styles.subtitle}>
                            Configura el workspace de ejemplo antes de operar (módulo en cuarentena).
                        </Text>
                    </View>
                </View>

                {/* ===== SECCIÓN: INFORMACIÓN BÁSICA ===== */}
                <SectionHeader icon={<Hash size={12} color={theme.colors.textMuted} strokeWidth={2} />} label="Información básica" />

                <View style={styles.fieldGroup}>
                    <FieldLabel text="Tipo operativo" />
                    <View style={styles.typeWrap}>
                        {WORKSPACE_OPERATIONAL_TYPE_OPTIONS.map((option) => {
                            const selected = type === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => setType(option.value)}
                                    style={[styles.typeChip, selected && styles.typeChipActive]}
                                >
                                    <Text style={[styles.typeChipText, selected && styles.typeChipTextActive]}>{option.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.fieldGroup}>
                    <FieldLabel text="Nombre del workspace" />
                    <Input
                        value={name}
                        onChangeText={(v) => {
                            setName(v);
                            if (nameError && v.trim()) setNameError(false);
                        }}
                        placeholder="Ej: Ferreteria El Dorado"
                        error={nameError}
                    />
                    {nameError && (
                        <Text style={styles.errorText}>
                            El nombre es requerido
                        </Text>
                    )}
                </View>

                <View style={styles.fieldGroup}>
                    <FieldLabel text="Direccion" />
                    <Input
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Ej: Calle 10 # 8-12"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <FieldLabel text="Telefono" />
                    <Input
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="Ej: 3001234567"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <FieldLabel text="Empleado (ID usuario)" />
                    <Input
                        value={employee}
                        onChangeText={setEmployee}
                        placeholder="Opcional"
                    />
                </View>

                {/* ===== CTA ===== */}
                <View style={styles.actions}>
                    <Animated.View style={{ transform: [{ scale: btnScale }], flex: 1 }}>
                        <Pressable
                            onPress={submit}
                            onPressIn={() => animateBtn(0.96)}
                            onPressOut={() => animateBtn(1)}
                            disabled={isPending}
                            style={[styles.submitBtn, isPending && styles.submitBtnPending]}
                        >
                            <CheckCircle
                                size={16}
                                color={theme.colors.background}
                                strokeWidth={2.5}
                            />
                                <Text style={styles.submitText}>
                                {isPending ? 'Creando…' : 'Crear negocio'}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </ScrollView>

            <ActionLoader
                visible={processing}
                steps={[
                    'Validando información…',
                    'Registrando workspace…',
                    'Configurando datos base…',
                    'Inicializando contexto…',
                    'Listo: workspace creado',
                ]}
            />
        </View>
    );
}

/* ================= UI helpers ================= */

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <View style={styles.sectionHeader}>
            {icon}
            <Text style={styles.sectionLabel}>{label}</Text>
        </View>
    );
}

function FieldLabel({ text }: { text: string }) {
    return <Text style={styles.fieldLabel}>{text}</Text>;
}

const styles = StyleSheet.create({
    /* layout */
    container: {
        backgroundColor: theme.colors.background,
        maxHeight: '90%',
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },

    /* header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surfaceSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        lineHeight: 22,
    },
    subtitle: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        marginTop: 2,
    },

    /* section */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    sectionLabel: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    /* fields */
    fieldGroup: {
        marginBottom: theme.spacing.md,
    },
    typeWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: theme.colors.surface,
    },
    typeChipActive: {
        borderColor: theme.colors.accent,
        backgroundColor: '#10306A',
    },
    typeChipText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: theme.weight.medium,
    },
    typeChipTextActive: {
        color: '#DCE8FF',
        fontWeight: theme.weight.semibold,
    },
    fieldLabel: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.medium,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },

    /* error */
    errorText: {
        marginTop: theme.spacing.xs,
        fontSize: theme.font.xs,
        color: theme.colors.danger,
    },

    /* actions */
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.accent,
    },
    submitBtnPending: {
        opacity: 0.55,
    },
    submitText: {
        textAlign: 'center',
        fontWeight: theme.weight.bold,
        fontSize: theme.font.md,
        color: theme.colors.background,
    },
});
