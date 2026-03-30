import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Menu, LogOut, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { useUiStore } from '@/stores/ui.store';
import { theme } from '@/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppNavigator';

type AppNav = NativeStackNavigationProp<AppStackParamList>;

export function AppHeader() {
    const navigation = useNavigation<AppNav>();
    const workspaces = useAuthStore((s) => s.workspaces);
    const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];
    const toggleMenu = useUiStore((s) => s.toggleMenu);
    const logout = useLogout();
    const scopeTitle = activeWorkspace?.name ?? 'Workspace';

    function onLogout() {
        Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: logout },
        ]);
    }

    return (
        <View style={styles.header}>
            <Pressable onPress={toggleMenu} hitSlop={10} style={styles.menuButton}>
                <Menu size={22} color={theme.colors.textPrimary} />
            </Pressable>

            <Pressable
                onPress={() => navigation.navigate('ProtectedOverview')}
                style={({ pressed }) => [styles.scopeSwitcher, pressed && styles.scopeSwitcherPressed]}
                hitSlop={8}
            >
                <Text numberOfLines={1} style={styles.scopeName}>
                    {scopeTitle}
                </Text>
                <ChevronRight size={14} color={theme.colors.textMuted} />
            </Pressable>

            <View style={styles.actionsRow}>
                <Pressable onPress={onLogout} hitSlop={10}>
                    <LogOut size={19} color={theme.colors.textSecondary} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    menuButton: {
        width: 28,
        alignItems: 'flex-start',
    },
    scopeSwitcher: {
        flex: 1,
        minWidth: 0,
        marginHorizontal: 10,
        maxWidth: '60%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 4,
        borderRadius: 10,
    },
    scopeSwitcherPressed: {
        backgroundColor: theme.colors.surfaceSoft,
    },
    scopeName: {
        maxWidth: '92%',
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 52,
        justifyContent: 'flex-end',
    },
});
