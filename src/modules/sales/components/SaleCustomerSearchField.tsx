import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';

type Props = {
  phone: string;
  onChangePhone: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  linkedCustomerLabel?: string;
};

export function SaleCustomerSearchField({
  phone,
  onChangePhone,
  onSearch,
  isSearching,
  linkedCustomerLabel,
}: Props) {
  return (
    <View>
      <View style={styles.row}>
        <Input
          value={phone}
          onChangeText={onChangePhone}
          placeholder="Telefono"
          keyboardType="phone-pad"
          style={styles.phoneInput}
        />
        <Pressable style={styles.searchBtn} onPress={onSearch} disabled={isSearching}>
          <Search size={16} color="#9FC0FF" />
        </Pressable>
      </View>
      {!!linkedCustomerLabel && <Text style={styles.linkedHint}>Cliente activo: {linkedCustomerLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneInput: {
    flex: 1,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedHint: {
    marginTop: 6,
    color: '#84D9B3',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
});
