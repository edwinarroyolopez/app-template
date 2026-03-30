import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';

type EmployeeOption = {
  _id: string;
  name?: string;
  lastName?: string;
  phone?: string;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle: string;
  searchValue: string;
  searchPlaceholder: string;
  options: EmployeeOption[];
  selectedId?: string;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onSelect: (employeeId?: string) => void;
  onSave: () => void;
};

export function ResponsibleSelectorModal({
  visible,
  title,
  subtitle,
  searchValue,
  searchPlaceholder,
  options,
  selectedId,
  onClose,
  onSearchChange,
  onSelect,
  onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>{subtitle}</Text>

          <Input
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            style={styles.modalInputSpacing}
          />

          <ScrollView style={styles.responsibleList}>
            <Pressable
              style={[styles.responsibleOption, !selectedId && styles.responsibleOptionActive]}
              onPress={() => onSelect(undefined)}
            >
              <Text style={[styles.responsibleOptionText, !selectedId && styles.responsibleOptionTextActive]}>
                Sin asignar
              </Text>
            </Pressable>

            {options.map((employee) => {
              const fullName = `${employee.name || ''} ${employee.lastName || ''}`.trim();
              const active = selectedId === employee._id;

              return (
                <Pressable
                  key={employee._id}
                  style={[styles.responsibleOption, active && styles.responsibleOptionActive]}
                  onPress={() => onSelect(employee._id)}
                >
                  <Text style={[styles.responsibleOptionText, active && styles.responsibleOptionTextActive]}>
                    {fullName}
                  </Text>
                  <Text style={styles.responsibleOptionPhone}>{employee.phone}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.modalActionsRow}>
            <Pressable style={styles.modalGhostBtn} onPress={onClose}>
              <Text style={styles.modalGhostText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.modalPrimaryBtn} onPress={onSave}>
              <Text style={styles.modalPrimaryText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#8EA4CC',
    fontSize: theme.font.sm,
  },
  modalInputSpacing: {
    marginTop: 8,
  },
  responsibleList: {
    marginTop: 10,
    maxHeight: 220,
  },
  responsibleOption: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  responsibleOptionActive: {
    borderColor: '#F8C74A',
    backgroundColor: '#2E2412',
  },
  responsibleOptionText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.sm,
  },
  responsibleOptionTextActive: {
    color: '#F8C74A',
  },
  responsibleOptionPhone: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  modalActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  modalGhostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.weight.semibold,
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#041427',
    fontWeight: theme.weight.bold,
  },
});
