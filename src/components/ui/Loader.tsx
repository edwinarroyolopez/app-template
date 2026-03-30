import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '@/theme';

type Props = {
    message?: string;
    fullscreen?: boolean;
};

export function Loader({ message = 'Cargando…', fullscreen = true }: Props) {
    return (
        <View
            style={{
                flex: fullscreen ? 1 : undefined,
                justifyContent: 'center',
                alignItems: 'center',
                padding: theme.spacing.lg,
            }}
        >
            <ActivityIndicator
                size="large"
                color={theme.colors.accent}
            />

            {message && (
                <Text
                    style={{
                        marginTop: theme.spacing.md,
                        color: theme.colors.textMuted,
                        fontSize: theme.font.sm,
                    }}
                >
                    {message}
                </Text>
            )}
        </View>
    );
}
