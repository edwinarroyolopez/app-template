import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { ImageAttachmentField } from '@/components/ui/ImageAttachmentField';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { api } from '@/services/api';
import { theme } from '@/theme';
import { formatMoneyInput, parseMoneyInput } from '@/utils/money';
import { useCreateManualTransaction } from '../hooks/useCreateManualTransaction';
import type { TransactionKind } from '../types/transaction.type';

function currentIsoDate() {
  return new Date().toISOString();
}

export function CreateTransactionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const createMutation = useCreateManualTransaction();

  const [kind, setKind] = useState<TransactionKind>('EXPENSE');
  const [amountInput, setAmountInput] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);

  const canSave = useMemo(() => parseMoneyInput(amountInput) > 0, [amountInput]);

  function resetAndClose() {
    setKind('EXPENSE');
    setAmountInput('');
    setTitle('');
    setCategory('');
    setNotes('');
    setProofImageUri(null);
    onClose();
  }

  async function uploadProofIfNeeded() {
    if (!proofImageUri) return undefined;

    const extMatch = proofImageUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = extMatch?.[1]?.toLowerCase() || 'jpg';
    const mimeByExt: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
    };

    const form = new FormData();
    form.append('file', {
      uri: proofImageUri,
      name: `transaction-proof-${Date.now()}.${ext}`,
      type: mimeByExt[ext] || 'image/jpeg',
    } as any);

    const { data } = await api.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!data?.original) return undefined;
    return {
      url: String(data.original),
      publicId: data?.id ? String(data.id) : undefined,
      label: 'Comprobante manual',
    };
  }

  async function onSave() {
    const amountCop = parseMoneyInput(amountInput);
    if (amountCop <= 0) {
      Toast.show({ type: 'error', text1: 'Monto inválido' });
      return;
    }

    try {
      const proof = await uploadProofIfNeeded();
      await createMutation.mutateAsync({
        kind,
        amountCop,
        date: currentIsoDate(),
        title: title.trim() || undefined,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        proof,
      });

      Toast.show({ type: 'success', text1: 'Movimiento guardado' });
      resetAndClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo guardar',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <OperationalModal
      visible={visible}
      onClose={resetAndClose}
      title="Nuevo movimiento manual"
      contentContainerStyle={styles.content}
      footer={
        <View style={styles.actionsRow}>
          <Pressable style={styles.cancelBtn} onPress={resetAndClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>

          <Pressable
            style={[styles.saveBtn, (!canSave || createMutation.isPending) && styles.saveBtnDisabled]}
            onPress={onSave}
            disabled={!canSave || createMutation.isPending}
          >
            <Text style={styles.saveText}>{createMutation.isPending ? 'Guardando...' : 'Guardar'}</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.kindRow}>
        <Pressable
          style={[styles.kindBtn, kind === 'INCOME' && styles.kindBtnActiveIncome]}
          onPress={() => setKind('INCOME')}
        >
          <Text style={styles.kindText}>Ingreso</Text>
        </Pressable>

        <Pressable
          style={[styles.kindBtn, kind === 'EXPENSE' && styles.kindBtnActiveExpense]}
          onPress={() => setKind('EXPENSE')}
        >
          <Text style={styles.kindText}>Egreso</Text>
        </Pressable>
      </View>

      <TextInput
        value={amountInput}
        onChangeText={(value) => setAmountInput(formatMoneyInput(value))}
        keyboardType="numeric"
        placeholder="Monto"
        placeholderTextColor="#6F87B3"
        style={styles.input}
      />

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Título (opcional)"
        placeholderTextColor="#6F87B3"
        style={styles.input}
      />

      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Categoría (opcional)"
        placeholderTextColor="#6F87B3"
        style={styles.input}
      />

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notas (opcional)"
        placeholderTextColor="#6F87B3"
        style={[styles.input, styles.notesInput]}
        multiline
      />

      <ImageAttachmentField
        title="Comprobante (opcional)"
        helperText="Adjunta recibo o soporte del movimiento."
        images={proofImageUri ? [{ uri: proofImageUri }] : []}
        onChange={(next) => setProofImageUri(next[0]?.uri || null)}
        maxImages={1}
      />

      <ActionLoader
        visible={createMutation.isPending}
        steps={['Validando movimiento...', 'Guardando transacción...', 'Actualizando resumen...']}
      />
    </OperationalModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  kindRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kindBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    paddingVertical: 8,
  },
  kindBtnActiveIncome: {
    borderColor: '#1F6F59',
    backgroundColor: '#0E2C23',
  },
  kindBtnActiveExpense: {
    borderColor: '#7A2630',
    backgroundColor: '#321722',
  },
  kindText: {
    color: '#DDE8FF',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1F3765',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#0A1835',
    color: '#DDE8FF',
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  actionsRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#29466F',
    backgroundColor: '#243956',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#DDE8FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xs,
  },
  saveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.55,
  },
  saveText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xs,
  },
});
