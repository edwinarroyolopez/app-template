// src/components/ui/Input.tsx
import { TextInput, TextInputProps } from 'react-native';
import { theme } from '@/theme';

type Props = TextInputProps & {
    error?: boolean;
};

export function Input({ style, error, ...props }: Props) {
    return (
        <TextInput
            {...props}
            placeholderTextColor={theme.colors.textMuted}
            style={[
                {
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.md,
                    borderWidth: 1,
                    borderColor: error
                        ? theme.colors.danger
                        : theme.colors.border,
                    backgroundColor: theme.colors.surfaceSoft,
                    color: theme.colors.textPrimary,
                    fontSize: theme.font.md,
                },
                style,
            ]}
        />
    );
}
