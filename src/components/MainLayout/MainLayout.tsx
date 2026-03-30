// src/components/MainLayout/MainLayout.tsx
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader/AppHeader';
import { BottomBar } from '@/components/BottomBar/BottomBar';
import AppMenu from '@/components/AppMenu/AppMenu';
import { theme } from '@/theme';
import { OfflineBanner } from '@/components/OfflineBanner/OfflineBanner';

import { useAuthStore } from '@/stores/auth.store';
import { useOperationalSyncBridge } from '@/hooks/useOperationalSyncBridge';

function AuthSyncBridge() {
    useOperationalSyncBridge();

    return null;
}

export function MainLayout({
    children,
    hideHeader,
    hideBottomBar,
}: {
    children: React.ReactNode;
    hideHeader?: boolean;
    hideBottomBar?: boolean;
}) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
            {isAuthenticated && <AuthSyncBridge />}

            {/* 1. Header fijo arriba con safe area */}
            {!hideHeader && (
                <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.surface }}>
                    <AppHeader />
                </View>
            )}

            {/* 2. Banner Offline (Solo aparece cuando no hay red) */}
            <OfflineBanner />

            {/* 3. Contenido Principal */}
            <View style={styles.container}>
                {children}
            </View>

            {/* 4. Navegación Inferior */}
            {!hideBottomBar && <BottomBar />}

            {/* 5. Menú Lateral (Overlay absoluto) */}
            <AppMenu />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
    }
});
