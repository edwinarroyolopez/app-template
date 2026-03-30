// src/components/ui/SectionHeader.tsx
import { View, Text, Pressable } from 'react-native';
import { theme } from '@/theme';

type Props = {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        onPress: () => void;
    };
};

export function SectionHeader({
    title,
    subtitle,
    action,
}: Props) {
    return (
        <View style={{ marginBottom: theme.spacing.sm }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        color: theme.colors.textPrimary,
                        fontSize: theme.font.md,
                        fontWeight: theme.weight.bold,
                    }}
                >
                    {title}
                </Text>

                {action && (
                    <Pressable onPress={action.onPress}>
                        <Text
                            style={{
                                color: theme.colors.accent,
                                fontSize: theme.font.sm,
                                fontWeight: theme.weight.semibold,
                            }}
                        >
                            {action.label}
                        </Text>
                    </Pressable>
                )}
            </View>

            {subtitle && (
                <Text
                    style={{
                        marginTop: 2,
                        color: theme.colors.textMuted,
                        fontSize: theme.font.xs,
                    }}
                >
                    {subtitle}
                </Text>
            )}
        </View>
    );
}
