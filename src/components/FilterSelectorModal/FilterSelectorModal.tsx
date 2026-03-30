import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';

import { theme } from '@/theme';
import type { FilterOption } from './types';

type Props<T extends string> = {
  visible: boolean;
  title: string;
  value: T;
  options: FilterOption<T>[];
  onClose: () => void;
  onChange: (value: T) => void;
  density?: 'default' | 'compact';
  showOptionIcon?: boolean;
};

export function FilterSelectorModal<T extends string>({
  visible,
  title,
  value,
  options,
  onClose,
  onChange,
  density = 'default',
  showOptionIcon = true,
}: Props<T>) {
  const isCompact = density === 'compact';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, isCompact && styles.sheetCompact]}>
          <View style={[styles.header, isCompact && styles.headerCompact]}>
            <Pressable onPress={onClose} hitSlop={8}>
              <ArrowLeft size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Text style={[styles.headerTitle, isCompact && styles.headerTitleCompact]}>{title}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={[styles.content, isCompact && styles.contentCompact]}>
            {options.map((option) => {
              const active = option.value === value;
              const Icon = option.icon;

              if (isCompact) {
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.optionRowCompact, active && styles.optionRowCompactActive]}
                    onPress={() => {
                      onChange(option.value);
                      onClose();
                    }}
                  >
                    <View style={styles.optionMainCompact}>
                      {showOptionIcon ? (
                        <Icon size={15} color={active ? '#9FC0FF' : '#5F759D'} />
                      ) : null}
                      <Text style={[styles.optionTextCompact, active && styles.optionTextCompactActive]}>{option.label}</Text>
                    </View>

                    <View style={styles.optionCheckWrap}>
                      {active ? <Check size={15} color={theme.colors.accent} /> : null}
                    </View>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionCard, active && styles.optionCardActive]}
                  onPress={() => {
                    onChange(option.value);
                    onClose();
                  }}
                >
                  {showOptionIcon ? <Icon size={20} color={active ? theme.colors.accent : theme.colors.textMuted} /> : null}
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
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
  sheetCompact: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderColor: '#1A2F53',
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
  headerCompact: {
    height: 50,
    paddingHorizontal: 14,
  },
  headerTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  headerTitleCompact: {
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  headerSpacer: {
    width: 20,
  },
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 24,
  },
  contentCompact: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 4,
  },
  optionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  optionCardActive: {
    borderColor: '#2E6BFF',
    backgroundColor: '#0D224A',
  },
  optionText: {
    color: '#8EA4CC',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
  optionTextActive: {
    color: '#2E6BFF',
  },
  optionRowCompact: {
    minHeight: 42,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  optionRowCompactActive: {
    borderWidth: 1,
    borderColor: '#2E6BFF44',
    backgroundColor: '#10284F',
  },
  optionMainCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionTextCompact: {
    color: '#8EA4CC',
    fontSize: theme.font.sm,
    fontWeight: theme.weight.medium,
  },
  optionTextCompactActive: {
    color: '#EAF1FF',
    fontWeight: theme.weight.semibold,
  },
  optionCheckWrap: {
    width: 18,
    alignItems: 'flex-end',
  },
});
