import React, { useEffect, useMemo, useState } from 'react';
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
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { theme } from '@/theme';
import { useAuthStore } from '@/stores/auth.store';
import type { Employee, EmployeeRole } from '../types/employee.type';
import { useUpdateEmployee } from '../hooks/useUpdateEmployee';

type Props = {
  visible: boolean;
  employee?: Employee | null;
  onClose: () => void;
};

const ROLE_OPTIONS: Array<{ value: EmployeeRole; label: string }> = [
  { value: 'WORKSPACE_MANAGER', label: 'Encargado de workspace' },
  { value: 'SELLER', label: 'Vendedor' },
  { value: 'MANUFACTURER', label: 'Fabricante' },
  { value: 'TRANSPORTER', label: 'Transportador' },
  { value: 'GENERAL_SUPPORT', label: 'Apoyo general' },
];

export function EditEmployeeModal({ visible, employee, onClose }: Props) {
  const updateEmployee = useUpdateEmployee();
  const accountWorkspaces = useAuthStore((s) => s.workspaces || []);

  const [role, setRole] = useState<EmployeeRole>('GENERAL_SUPPORT');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!employee) return;
    setRole(employee.role || 'GENERAL_SUPPORT');
    setSelectedWorkspaceId(employee.managedWorkspaceId);
  }, [employee]);

  const canAssignWorkspace = role === 'WORKSPACE_MANAGER' && !!employee?.isSystemUser;

  const workspaceOptions = useMemo(() => {
    return accountWorkspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
    }));
  }, [accountWorkspaces]);

  async function handleSave() {
    if (!employee || updateEmployee.isPending) return;

    try {
      await updateEmployee.mutateAsync({
        employeeId: employee._id,
        payload: {
          role,
          ...(canAssignWorkspace
            ? {
                managedWorkspaceId: selectedWorkspaceId,
                clearManagedWorkspace: !selectedWorkspaceId,
              }
            : {
                clearManagedWorkspace: true,
              }),
        },
      });

      Toast.show({ type: 'success', text1: 'Empleado actualizado' });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Editar empleado</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <BriefcaseBusiness size={18} color="#9FC0FF" />
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>Control operativo</Text>
                <Text style={styles.heroSubtitle}>Ajusta rol y asigna negocio del encargado.</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Datos del empleado</Text>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Nombre</Text>
                <Text style={styles.dataValue}>{employee?.name || '-'} {employee?.lastName || ''}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Telefono</Text>
                <Text style={styles.dataValue}>{employee?.phone || '-'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Usuario app</Text>
                <Text style={styles.dataValue}>{employee?.isSystemUser ? 'Si' : 'No'}</Text>
              </View>
            </View>

            <View style={[styles.sectionCard, styles.spacingTop]}>
              <Text style={styles.sectionTitle}>Rol del empleado</Text>
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
            </View>

            <View style={[styles.sectionCard, styles.spacingTop]}>
              <Text style={styles.sectionTitle}>Workspace asignado</Text>

              {!employee?.isSystemUser ? (
                <Text style={styles.helperText}>Para asignar workspace, el empleado debe tener usuario del sistema.</Text>
              ) : role !== 'WORKSPACE_MANAGER' ? (
                <Text style={styles.helperText}>Solo el rol Encargado de workspace puede administrar un workspace.</Text>
              ) : (
                <View style={styles.workspaceWrap}>
                  <Pressable
                    style={[styles.workspaceChip, !selectedWorkspaceId && styles.workspaceChipActive]}
                    onPress={() => setSelectedWorkspaceId(undefined)}
                  >
                    <Text style={[styles.workspaceChipText, !selectedWorkspaceId && styles.workspaceChipTextActive]}>
                      Sin workspace asignado
                    </Text>
                  </Pressable>

                  {workspaceOptions.map((ws) => {
                    const active = selectedWorkspaceId === ws.id;
                    return (
                      <Pressable
                        key={ws.id}
                        style={[styles.workspaceChip, active && styles.workspaceChipActive]}
                        onPress={() => setSelectedWorkspaceId(ws.id)}
                      >
                        <Text style={[styles.workspaceChipText, active && styles.workspaceChipTextActive]}>
                          {ws.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
    maxHeight: '92%',
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
    paddingBottom: 30,
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
  spacingTop: {
    marginTop: 12,
  },
  sectionTitle: {
    color: '#B3C3E2',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
    marginBottom: 8,
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
  workspaceWrap: {
    gap: 8,
  },
  workspaceChip: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  workspaceChipActive: {
    borderColor: '#F8C74A66',
    backgroundColor: '#2E2412',
  },
  workspaceChipText: {
    color: '#9FB0CF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  workspaceChipTextActive: {
    color: '#F8C74A',
    fontWeight: theme.weight.semibold,
  },
  helperText: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  dataRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataLabel: {
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  dataValue: {
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
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
