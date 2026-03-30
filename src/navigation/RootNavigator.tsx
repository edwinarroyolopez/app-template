import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/stores/auth.store';
import AppNavigator from './AppNavigator';
import PublicNavigator from './PublicNavigator';
import { OfflineGate } from '@/components/OfflineGate/OfflineGate';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/theme';
import { useMe } from '@/modules/auth/hooks/useMe';
import { useSyncLegacyOperationalFromMe } from '@/quarantine/legacy-domain/bootstrap/useSyncLegacyOperationalFromMe';
import { useEffect, useState } from 'react';
import { useAppVersionCheck } from '@/boot/useAppVersionCheck';
import { navigationRef } from './navigationRef';
import { flushPendingPushNavigation } from '@/notifications/pushNotifications';

export default function RootNavigator() {
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const [isHydrated, setIsHydrated] = useState(useAuthStore.persist.hasHydrated());

    useEffect(() => {
        setIsHydrated(useAuthStore.persist.hasHydrated());

        const unsubHydrate = useAuthStore.persist.onHydrate(() => {
            setIsHydrated(false);
        });

        const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });

        const safetyTimer = setTimeout(() => {
            if (!useAuthStore.persist.hasHydrated()) {
                setIsHydrated(true);
            }
        }, 3000);

        return () => {
            unsubHydrate();
            unsubFinish();
            clearTimeout(safetyTimer);
        };
    }, []);

    const meQuery = useMe();
    useSyncLegacyOperationalFromMe(meQuery);
    useAppVersionCheck(isHydrated);

    useEffect(() => {
        if (!isAuthenticated) return;
        flushPendingPushNavigation();
    }, [isAuthenticated]);

    if (!isHydrated) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background,
            }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={flushPendingPushNavigation}
        >
            <OfflineGate>
                {isAuthenticated ? <AppNavigator /> : <PublicNavigator />}
            </OfflineGate>
        </NavigationContainer>
    );
}
