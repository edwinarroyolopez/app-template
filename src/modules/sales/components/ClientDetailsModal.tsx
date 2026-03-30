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
import { ArrowLeft, Search } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { useSearchCustomerByPhone } from '../hooks/useSearchCustomerByPhone';
import type { SaleDetails } from '../types/sale.type';

type Props = {
  visible: boolean;
  initialValue: SaleDetails;
  onClose: () => void;
  onSave: (value: Pick<SaleDetails, 'clientId' | 'clientName' | 'clientPhone' | 'clientAddress'>) => void;
};

export function ClientDetailsModal({ visible, initialValue, onClose, onSave }: Props) {
  const searchCustomerByPhone = useSearchCustomerByPhone();

  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [showFoundCustomerModal, setShowFoundCustomerModal] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<{
    _id: string;
    name?: string;
    phone: string;
    address?: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;

    setClientId(initialValue.clientId || undefined);
    setClientName(initialValue.clientName || '');
    setClientPhone(initialValue.clientPhone || '');
    setClientAddress(initialValue.clientAddress || '');
    setFoundCustomer(null);
    setShowFoundCustomerModal(false);
  }, [visible, initialValue]);

  async function handleSearchCustomer() {
    if (!clientPhone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Falta el telefono',
        text2: 'Ingresa un numero para buscar cliente.',
      });
      return;
    }

    try {
      const found = await searchCustomerByPhone.mutateAsync(clientPhone.trim());

      if (!found) {
        Toast.show({
          type: 'info',
          text1: 'Sin coincidencias',
          text2: 'No hay cliente activo con ese telefono.',
        });
        return;
      }

      setFoundCustomer(found);
      setShowFoundCustomerModal(true);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'No se pudo buscar',
        text2: 'Revisa la conexion e intenta de nuevo.',
      });
    }
  }

  function applyFoundCustomer() {
    if (!foundCustomer) return;

    setClientId(foundCustomer._id);
    setClientName(foundCustomer.name || '');
    setClientPhone(foundCustomer.phone || '');
    setClientAddress(foundCustomer.address || '');
    setShowFoundCustomerModal(false);

    Toast.show({
      type: 'success',
      text1: 'Cliente aplicado',
      text2: 'Se cargaron los datos del cliente encontrado.',
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Datos del cliente</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <Input
                value={clientName}
                onChangeText={(value) => {
                  setClientName(value);
                  setClientId(undefined);
                }}
                placeholder="Ej: Laura Mendoza"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Telefono</Text>
              <View style={styles.phoneRow}>
                <Input
                  value={clientPhone}
                  onChangeText={(value) => {
                    setClientPhone(value);
                    setClientId(undefined);
                  }}
                  placeholder="Ej: 3001234567"
                  keyboardType="phone-pad"
                  style={styles.phoneInput}
                />

                <Pressable
                  style={styles.searchCustomerBtn}
                  onPress={handleSearchCustomer}
                  disabled={searchCustomerByPhone.isPending}
                >
                  <Search size={18} color={theme.colors.accent} />
                </Pressable>
              </View>

              {!!clientId && (
                <Text style={styles.linkedCustomerHint}>Cliente vinculado: {clientName || clientPhone}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Direccion</Text>
              <Input
                value={clientAddress}
                onChangeText={(value) => {
                  setClientAddress(value);
                  setClientId(undefined);
                }}
                placeholder="Ej: Calle 10 # 12 - 33"
              />
            </View>

            <Pressable
              style={styles.saveButton}
              onPress={() => {
                onSave({
                  clientId,
                  clientName: clientName.trim() || undefined,
                  clientPhone: clientPhone.trim() || undefined,
                  clientAddress: clientAddress.trim() || undefined,
                });
              }}
            >
              <Text style={styles.saveButtonText}>Guardar cliente</Text>
            </Pressable>
          </ScrollView>
        </View>

        <Modal
          visible={showFoundCustomerModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFoundCustomerModal(false)}
        >
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Cliente encontrado</Text>
              <Text style={styles.confirmSubtitle}>Quieres usar este cliente en la venta?</Text>

              <View style={styles.confirmDataBlock}>
                <Text style={styles.confirmDataText}>Nombre: {foundCustomer?.name || 'Sin nombre'}</Text>
                <Text style={styles.confirmDataText}>Telefono: {foundCustomer?.phone}</Text>
                <Text style={styles.confirmDataText}>Direccion: {foundCustomer?.address || 'Sin direccion'}</Text>
              </View>

              <View style={styles.confirmActions}>
                <Pressable
                  style={styles.confirmGhostBtn}
                  onPress={() => setShowFoundCustomerModal(false)}
                >
                  <Text style={styles.confirmGhostText}>Cancelar</Text>
                </Pressable>

                <Pressable style={styles.confirmPrimaryBtn} onPress={applyFoundCustomer}>
                  <Text style={styles.confirmPrimaryText}>Usar cliente</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    maxHeight: '90%',
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
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#B3C3E2',
    marginBottom: 6,
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneInput: {
    flex: 1,
  },
  searchCustomerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedCustomerHint: {
    marginTop: 6,
    color: '#22C55E',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  saveButton: {
    marginTop: 10,
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#08142D',
    padding: 16,
  },
  confirmTitle: {
    color: '#EAF1FF',
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
  },
  confirmSubtitle: {
    marginTop: 4,
    color: '#8EA4CC',
    fontSize: theme.font.sm,
  },
  confirmDataBlock: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 10,
    gap: 4,
  },
  confirmDataText: {
    color: '#C8D7F1',
    fontSize: theme.font.sm,
  },
  confirmActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  confirmGhostBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmGhostText: {
    color: '#8EA4CC',
    fontWeight: theme.weight.semibold,
  },
  confirmPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2E6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPrimaryText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
  },
});
