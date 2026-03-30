import { View, Text, Pressable } from 'react-native';
import { theme } from '@/theme';

type Props = {
    label: string;
    value: number;
    onChange: (value: number) => void;
};

export function TraditionalUnitStepper({
    label,
    value,
    onChange,
}: Props) {
    function inc() {
        onChange(value + 1);
    }

    function dec() {
        if (value <= 0) return;
        onChange(value - 1);
    }

    return (
        <View style={{ marginTop: theme.spacing.md }}>
            <Text
                style={{
                    fontSize: theme.font.sm,
                    color: theme.colors.textSecondary,
                    marginBottom: 6,
                }}
            >
                {label}
            </Text>

            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surfaceSoft,
                    borderRadius: theme.radius.md,
                    overflow: 'hidden',
                }}
            >
                <Pressable
                    onPress={dec}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: theme.colors.border,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: theme.weight.bold,
                        }}
                    >
                        –
                    </Text>
                </Pressable>

                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: theme.font.lg,
                            fontWeight: theme.weight.bold,
                            color: theme.colors.textPrimary,
                        }}
                    >
                        {value}
                    </Text>
                </View>

                <Pressable
                    onPress={inc}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: theme.colors.accent,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: theme.weight.bold,
                            color: '#000',
                        }}
                    >
                        +
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
