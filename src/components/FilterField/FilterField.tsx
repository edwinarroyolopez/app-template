import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { theme } from '@/theme';

export function FilterField({
  label,
  value,
  icon: Icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.field} onPress={onPress}>
      <View style={styles.fieldLeft}>
        <Icon size={16} color="#2E8CFF" />
        <View>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value}</Text>
        </View>
      </View>
      <ChevronRight size={16} color="#8EA4CC" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0B1A36',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.medium,
  },
  fieldValue: {
    marginTop: 1,
    color: '#EAF1FF',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
});
