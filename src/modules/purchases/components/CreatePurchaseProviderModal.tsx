import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CheckCircle2, MapPin, Phone, UserPlus } from 'lucide-react-native';

import { ActionLoader } from '@/components/ui/ActionLoader';
import { Input } from '@/components/ui/Input';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { theme } from '@/theme';
import type { Provider } from '../types/provider.type';
import { useCreateProvider } from '../hooks/useCreateProvider';

export type CreatePurchaseProviderForm = {
  name: string;
  phone?: string;
  address?: string;
  rating: 1 | 2 | 3 | 4 | 5;
};

type Props = {
  visible: boolean;
  initialValue?: string;
  onClose: () => void;
  onCreated: (provider: Provider) => void;
};

export function CreatePurchaseProviderModal({
  visible,
  initialValue,
  onClose,
  onCreated,
}: Props) {
  const createProvider = useCreateProvider();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0.7)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setName(initialValue || '');
    setPhone('');
    setAddress('');
    setRating(3);
    setShowSuccess(false);
    successScale.setValue(0.7);
    successOpacity.setValue(0);
  }, [visible, initialValue, successOpacity, successScale]);

  const canSave = name.trim().length >= 2;

  async function handleCreate() {
    if (!canSave || createProvider.isPending) return;

    const payload: CreatePurchaseProviderForm = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      rating,
    };

    const provider = await createProvider.mutateAsync(payload);
    setShowSuccess(true);

    Animated.parallel([
      Animated.timing(successScale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowSuccess(false);
        onCreated(provider as Provider);
        onClose();
      }, 320);
    });
  }

  return (
    <>
      <OperationalModal
        visible={visible}
        onClose={onClose}
        title="Nuevo proveedor"
        headerLeft={
          <Pressable onPress={onClose} hitSlop={8}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>
        }
        headerRight={<View style={styles.headerSpacer} />}
        contentContainerStyle={styles.content}
        footer={
          <Pressable
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleCreate}
            disabled={!canSave}
          >
            <UserPlus size={18} color="#F0F6FF" />
            <Text style={styles.saveBtnText}>Crear proveedor</Text>
          </Pressable>
        }
      >
        <View style={styles.formPrimaryCard}>
          <Text style={styles.fieldLabelPrimary}>Nombre del proveedor</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ej: Distribuidora Global"
            autoFocus
            style={styles.nameInput}
          />

          <Text style={styles.fieldHint}>Este es el dato principal para identificarlo en compras.</Text>

          <View style={styles.secondaryFieldsWrap}>
            <Text style={styles.secondaryTitle}>Datos opcionales</Text>

            <Text style={styles.fieldLabelSecondary}>Telefono</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={15} color="#8EA4CC" />
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej: 3001234567"
                keyboardType="phone-pad"
                style={styles.iconInput}
              />
            </View>

            <Text style={styles.fieldLabelSecondary}>Direccion</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={15} color="#8EA4CC" />
              <Input
                value={address}
                onChangeText={setAddress}
                placeholder="Ej: Calle 12 # 10 - 24"
                style={styles.iconInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.fieldLabelSecondary}>Calificacion</Text>
          <Text style={styles.ratingHint}>Selecciona una referencia inicial del proveedor.</Text>
          <View style={styles.ratingRow}>
            {[5, 4, 3, 2, 1].map((value) => {
              const active = rating === value;
              return (
                <Pressable
                  key={value}
                  style={[styles.ratingBtn, active && styles.ratingBtnActive]}
                  onPress={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
                >
                  <Text style={[styles.ratingBtnText, active && styles.ratingBtnTextActive]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {showSuccess && (
          <View style={styles.successOverlay} pointerEvents="none">
            <Animated.View
              style={[
                styles.successCard,
                {
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <CheckCircle2 size={20} color="#22C55E" />
              <Text style={styles.successText}>Proveedor creado</Text>
            </Animated.View>
          </View>
        )}
      </OperationalModal>

      <ActionLoader
        visible={createProvider.isPending}
        steps={[
          'Validando proveedor...',
          'Guardando datos...',
          'Actualizando listado...',
          'Finalizando proveedor...',
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerSpacer: { width: 20 },
  content: {
    gap: 9,
  },
  formPrimaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D3D6E',
    backgroundColor: '#0B1D3D',
    padding: 12,
  },
  fieldLabelPrimary: {
    color: '#B3C3E2',
    marginBottom: 6,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  nameInput: {
    minHeight: 44,
  },
  fieldHint: {
    marginTop: 5,
    color: '#8397BA',
    fontSize: theme.font.xs,
    lineHeight: 16,
  },
  secondaryFieldsWrap: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#1A3761',
    paddingTop: 10,
  },
  secondaryTitle: {
    color: '#89A4CE',
    fontSize: theme.font.xs,
    marginBottom: 7,
    fontWeight: theme.weight.semibold,
  },
  fieldLabelSecondary: {
    color: '#A5B8DC',
    marginBottom: 5,
    marginTop: 7,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.medium,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
  },
  iconInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  ratingCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D3D6E',
    backgroundColor: '#0B1D3D',
    padding: 12,
  },
  ratingHint: {
    marginTop: 2,
    color: '#8397BA',
    fontSize: theme.font.xs,
    marginBottom: 7,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A4A79',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#2A251C',
  },
  ratingBtnText: {
    color: '#C7D6EF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  ratingBtnTextActive: {
    color: '#FBBF24',
  },
  saveBtn: {
    marginTop: 2,
    height: 46,
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
  saveBtnText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.sm,
  },
  successOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F6F59',
    backgroundColor: '#0E2C24',
    paddingHorizontal: 12,
    height: 44,
  },
  successText: {
    color: '#D6FBEA',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
});
