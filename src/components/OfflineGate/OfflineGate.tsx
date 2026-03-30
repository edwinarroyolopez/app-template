import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useAuthStore } from '@/stores/auth.store';
import { theme } from '@/theme';

export function OfflineGate({ children }: { children: ReactNode }) {
    const isOnline = useIsOnline();
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);

    if (!isAuthenticated && !isOnline) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.background,
                }}
            >
                <Text style={{ fontSize: theme.font.lg, fontWeight: 'bold' }}>
                    Sin conexión
                </Text>

                <Text
                    style={{
                        marginTop: 8,
                        textAlign: 'center',
                        color: theme.colors.textSecondary,
                    }}
                >
                    Necesitas conexión a internet para iniciar sesión
                </Text>
            </View>
        );
    }

    return <>{children}</>;
}
