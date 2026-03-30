import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Wrench } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useCreateGarmentMachine } from '../hooks/useGarmentWorkshop';

type Machine = {
  _id: string;
  name: string;
  code?: string;
};

type Props = {
  visible: boolean;
  initialValue?: string;
  onClose: () => void;
  onCreated: (machine: Machine) => void;
};

export function CreateGarmentMachineModal({ visible, initialValue, onClose, onCreated }: Props) {
  const createMachine = useCreateGarmentMachine();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(initialValue || '');
    setCode('');
  }, [visible, initialValue]);

  const canSave = name.trim().length >= 2;

  async function handleCreate() {
    if (!canSave || createMachine.isPending) return;
    try {
      const machine = await createMachine.mutateAsync({
        name: name.trim(),
        code: code.trim() || undefined,
      });
      Toast.show({ type: 'success', text1: 'Máquina creada' });
      onCreated(machine as Machine);
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear máquina',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Nueva máquina</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Nombre</Text>
            <Input value={name} onChangeText={setName} placeholder="Ej: Plana industrial" autoFocus />

            <Text style={styles.label}>Código (opcional)</Text>
            <Input value={code} onChangeText={setCode} placeholder="Ej: PL-01" />

            <Pressable
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleCreate}
              disabled={!canSave || createMachine.isPending}
            >
              <Wrench size={16} color="#F0F6FF" />
              <Text style={styles.saveText}>{createMachine.isPending ? 'Creando...' : 'Crear máquina'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
  headerSpacer: { width: 20 },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 8,
  },
  label: {
    color: '#B3C3E2',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  saveBtn: {
    marginTop: 4,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
});
