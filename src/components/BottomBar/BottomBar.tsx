// src/components/layout/BottomBar.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Lock } from 'lucide-react-native';

import { theme } from '@/theme';
import { buildBottomBarTabs } from './bottom-bar-registry';

type TabItemProps = {
    icon: any;
    route: string;
    activeRoute: string;
    onPress: () => void;
    locked?: boolean;
    hidden?: boolean;
};

function TabItem({
    icon: Icon,
    route,
    activeRoute,
    onPress,
    locked,
    hidden,
}: TabItemProps) {
    if (hidden) return null;

    const active = route === activeRoute;

    const color = active
        ? theme.colors.accent
        : theme.colors.textMuted;

    return (
        <Pressable
            disabled={locked}
            onPress={onPress}
            style={({ pressed }) => [
                styles.tabItem,
                pressed && !locked && { opacity: 0.6 },
                locked && { opacity: 0.45 },
            ]}
        >
            <View style={styles.iconWrap}>
                <Icon size={24} color={color} />

                {locked && (
                    <View style={styles.lockBadge}>
                        <Lock size={10} color="#000" />
                    </View>
                )}
            </View>
        </Pressable>
    );
}

export function BottomBar() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const active = route.name;
    const tabs = buildBottomBarTabs();

    return (
        <View
            style={[
                styles.container,
                {
                    height: 64 + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                ]}
        >
            {tabs.map((tab) => (
                <TabItem
                    key={`${tab.route}-${tab.target}`}
                    icon={tab.icon}
                    route={tab.route}
                    activeRoute={active}
                    hidden={tab.hidden}
                    onPress={() => navigation.navigate(tab.target)}
                />
            ))}
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },

    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconWrap: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* pequeño badge lock */
    lockBadge: {
        position: 'absolute',
        right: -2,
        top: -2,
        backgroundColor: theme.colors.accent,
        borderRadius: 999,
        padding: 2,
    },
});
