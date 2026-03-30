// src/components/ui/Card.tsx
import { View } from 'react-native';
import { theme } from '@/theme';

export function Card({ children }: { children: React.ReactNode }) {
    return (
        <View
            style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
            }}
        >
            {children}
        </View>
    );
}
