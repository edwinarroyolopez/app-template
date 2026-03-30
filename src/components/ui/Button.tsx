import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { theme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantStyles: Record<Variant, { backgroundColor: string; borderColor: string; textColor: string }> = {
  primary: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent, textColor: '#000' },
  secondary: { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border, textColor: theme.colors.textPrimary },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent', textColor: theme.colors.textSecondary },
  danger: { backgroundColor: '#4B161B', borderColor: '#8A2E3B', textColor: '#FDE8EB' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: palette.textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.font.sm,
    fontWeight: theme.weight.semibold,
  },
});
