import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useCreateEmployee } from '../hooks/useCreateEmployee';
import type { EmployeeRole } from '../types/employee.type';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialRole?: EmployeeRole;
  onCreated?: (employee: any) => void;
};

const VISIBILITY_OPTIONS = {
  ACCOUNT: 'ACCOUNT',
  CURRENT_WORKSPACE: 'CURRENT_WORKSPACE',
} as const;

type VisibilityScope = (typeof VISIBILITY_OPTIONS)[keyof typeof VISIBILITY_OPTIONS];

const ROLE_OPTIONS: Array<{ value: EmployeeRole; label: string }> = [
  { value: 'WORKSPACE_MANAGER', label: 'Encargado de workspace' },
  { value: 'SELLER', label: 'Vendedor' },
  { value: 'MANUFACTURER', label: 'Fabricante' },
  { value: 'TRANSPORTER', label: 'Transportador' },
  { value: 'GENERAL_SUPPORT', label: 'Apoyo general' },
];

export function CreateEmployeeModal({ visible, onClose, initialRole, onCreated }: Props) {
  const workspaceId = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext?.workspace.id);
  const createEmployee = useCreateEmployee();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<EmployeeRole>(initialRole || 'GENERAL_SUPPORT');
  const [isSystemUser, setIsSystemUser] = useState(false);
  const [visibilityScope, setVisibilityScope] = useState<VisibilityScope>(VISIBILITY_OPTIONS.ACCOUNT);

  useEffect(() => {
    if (!visible) return;
    setName('');
    setLastName('');
    setPhone('');
    setRole(initialRole || 'GENERAL_SUPPORT');
    setIsSystemUser(false);
    setVisibilityScope(VISIBILITY_OPTIONS.ACCOUNT);
  }, [visible, initialRole]);

  async function handleSave() {
    if (!name.trim() || !lastName.trim() || !phone.trim() || createEmployee.isPending) return;

    try {
      const createdEmployee = await createEmployee.mutateAsync({
        name: name.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        role,
        isSystemUser,
        workspaceIds:
          visibilityScope === VISIBILITY_OPTIONS.CURRENT_WORKSPACE && workspaceId
            ? [workspaceId]
            : undefined,
      });

      Toast.show({ type: 'success', text1: 'Empleado creado' });
      onCreated?.(createdEmployee);
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Nuevo empleado</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <View style={styles.heroIconWrap}>
                <Sparkles size={16} color="#9FC0FF" />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>Perfil operativo</Text>
                <Text style={styles.heroSubtitle}>Define rol, visibilidad y acceso con un flujo limpio.</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <Input value={name} onChangeText={setName} placeholder="Ej: Laura" />

              <Text style={[styles.fieldLabel, styles.spacingTop]}>Apellido</Text>
              <Input value={lastName} onChangeText={setLastName} placeholder="Ej: Mendoza" />

              <Text style={[styles.fieldLabel, styles.spacingTop]}>Telefono</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej: 3001234567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.sectionCard, styles.spacingTop]}>
              <Text style={styles.fieldLabel}>Rol operativo</Text>
              <View style={styles.roleWrap}>
                {ROLE_OPTIONS.map((option) => {
                  const active = role === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.roleChip, active && styles.roleChipActive]}
                      onPress={() => setRole(option.value)}
                    >
                      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable style={[styles.systemUserToggle, styles.spacingTop]} onPress={() => setIsSystemUser((v) => !v)}>
                <View style={styles.systemUserLeft}>
                  <View style={[styles.toggleCheckbox, isSystemUser && styles.toggleCheckboxActive]} />
                  <Text style={styles.toggleLabel}>Crear usuario del sistema</Text>
                </View>

                {isSystemUser && <ShieldCheck size={16} color="#22C55E" />}
              </Pressable>

              <Text style={styles.toggleHelpText}>
                Si activas esta opcion, el sistema crea automaticamente el usuario y lo vincula al empleado.
              </Text>
            </View>

            <View style={[styles.sectionCard, styles.spacingTop]}>
              <Text style={styles.fieldLabel}>Visibilidad</Text>
              <View style={styles.scopeRow}>
                <Pressable
                  style={[
                    styles.scopeChip,
                    visibilityScope === VISIBILITY_OPTIONS.ACCOUNT && styles.scopeChipActive,
                  ]}
                  onPress={() => setVisibilityScope(VISIBILITY_OPTIONS.ACCOUNT)}
                >
                  <Text
                    style={[
                      styles.scopeChipText,
                      visibilityScope === VISIBILITY_OPTIONS.ACCOUNT && styles.scopeChipTextActive,
                    ]}
                  >
                    Toda la cuenta
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.scopeChip,
                    visibilityScope === VISIBILITY_OPTIONS.CURRENT_WORKSPACE && styles.scopeChipActive,
                  ]}
                  onPress={() => setVisibilityScope(VISIBILITY_OPTIONS.CURRENT_WORKSPACE)}
                >
                  <Text
                    style={[
                      styles.scopeChipText,
                      visibilityScope === VISIBILITY_OPTIONS.CURRENT_WORKSPACE && styles.scopeChipTextActive,
                    ]}
                  >
                    Solo workspace actual
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar empleado</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#08142D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1F3765',
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#1A2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  headerSpacer: {
    width: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#24457F',
    backgroundColor: '#0B1D40',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#113066',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  heroSubtitle: {
    marginTop: 2,
    color: '#9FB0CF',
    fontSize: theme.font.xs,
  },
  sectionCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
  },
  fieldLabel: {
    color: '#B3C3E2',
    marginBottom: 6,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  spacingTop: {
    marginTop: 12,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scopeChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  scopeChipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  scopeChipText: {
    color: '#9FB0CF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
    textAlign: 'center',
  },
  scopeChipTextActive: {
    color: '#DCE8FF',
    fontWeight: theme.weight.semibold,
  },
  roleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  roleChipActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  roleChipText: {
    color: '#9FB0CF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.medium,
  },
  roleChipTextActive: {
    color: '#DCE8FF',
    fontWeight: theme.weight.semibold,
  },
  systemUserToggle: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#24457F',
    backgroundColor: '#0B1D40',
    paddingHorizontal: 10,
  },
  systemUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4B5E86',
    backgroundColor: '#0A1835',
  },
  toggleCheckboxActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#2E6BFF',
  },
  toggleLabel: {
    color: '#B3C3E2',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  toggleHelpText: {
    marginTop: 8,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
    lineHeight: 17,
  },
  saveButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
});
