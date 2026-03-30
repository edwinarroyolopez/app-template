// src/components/ui/Metric.tsx
import { View, Text } from 'react-native';
import { theme } from '@/theme';

export function Metric({
    icon,
    value,
    label,
    highlight,
}: {
    icon?: string;
    value: string;
    label: string;
    highlight?: boolean;
}) {
    return (
        <View style={{ marginTop: theme.spacing.sm }}>
            <Text
                style={{
                    fontSize: theme.font.xl,
                    fontWeight: theme.weight.black,
                    color: highlight
                        ? theme.colors.accent
                        : theme.colors.textPrimary,
                }}
            >
                {icon} {value}
            </Text>

            <Text
                style={{
                    fontSize: theme.font.sm,
                    color: theme.colors.textMuted,
                }}
            >
                {label}
            </Text>
        </View>
    );
}
