import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { theme } from '@/theme';

export function FilterChipField({
  label,
  value,
  onPress,
  active = true,
}: {
  label: string;
  value: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <ChevronDown size={13} color={active ? '#9FC0FF' : '#8EA4CC'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '49%',
  },
  chipActive: {
    borderColor: '#2E6BFF66',
    backgroundColor: '#0D224A',
  },
  label: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  value: {
    color: '#EAF1FF',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
    flexShrink: 1,
  },
});
