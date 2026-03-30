// src/components/ui/Screen.tsx
import { ScrollView } from 'react-native';
import { theme } from '@/theme';

export function Screen({ children }: { children: React.ReactNode }) {
    return (
        <ScrollView
            style={{ backgroundColor: theme.colors.background }}
            contentContainerStyle={{
                padding: theme.spacing.lg,
            }}
        >
            {children}
        </ScrollView>
    );
}
