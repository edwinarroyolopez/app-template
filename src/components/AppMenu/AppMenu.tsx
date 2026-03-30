import React, { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    ChevronRight,
    Landmark,
    LogOut,
    UserCircle2,
    X,
} from 'lucide-react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { theme } from '@/theme';
import { buildMenuSections, type MenuIcon, type MenuRoute } from './menu-registry';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.85;

type AppNav = NativeStackNavigationProp<AppStackParamList>;

function toRoleLabel(role?: string) {
    if (!role) return 'usuario';
    return role.toLowerCase().replace(/_/g, ' ');
}

export default function AppMenu() {
    const isOpen = useUiStore((s) => s.isMenuOpen);
    const closeMenu = useUiStore((s) => s.closeMenu);

    const user = useAuthStore((s) => s.user);
    const workspaces = useAuthStore((s) => s.workspaces);
    const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

    const navigation = useNavigation<AppNav>();
    const logout = useLogout();
    const currentRouteName = useNavigationState((state) => state.routes[state.index]?.name as MenuRoute | undefined);

    const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: isOpen ? 0 : -MENU_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: isOpen ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isOpen, opacity, translateX]);

    function go(route: MenuRoute) {
        closeMenu();
        navigation.navigate(route as never);
    }

    const sections = useMemo(() => buildMenuSections(), []);

    if (!isOpen) return null;

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.backdrop, { opacity }]}>
                <Pressable style={styles.backdropTouch} onPress={closeMenu} />
            </Animated.View>

            <Animated.View style={[styles.menuContainer, { transform: [{ translateX }] }]}>
                <View style={styles.userHeader}>
                    <View style={styles.avatarContainer}>
                        <UserCircle2 size={42} color={theme.colors.accent} />
                    </View>

                    <View style={styles.userMeta}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.name || 'Usuario'}
                        </Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{toRoleLabel(user?.role)}</Text>
                        </View>
                    </View>

                    <Pressable onPress={closeMenu} style={styles.closeButton}>
                        <X size={18} color={theme.colors.textMuted} />
                    </Pressable>
                </View>

                {activeWorkspace ? (
                    <Pressable onPress={() => go('ProtectedOverview')} style={styles.activeScopeCard}>
                        <View style={styles.activeScopeIconContainer}>
                            <Landmark size={18} color={theme.colors.accent} />
                        </View>

                        <View style={styles.activeScopeMeta}>
                            <Text style={styles.activeScopeLabel}>Active workspace</Text>
                            <Text style={styles.activeScopeName} numberOfLines={1}>
                                {activeWorkspace.name}
                            </Text>
                            <Text style={styles.activeScopeHint} numberOfLines={1}>
                                Scope for protected starter screens
                            </Text>
                        </View>

                        <ChevronRight size={15} color={theme.colors.textSecondary} />
                    </Pressable>
                ) : (
                    <View style={styles.activeScopeEmpty}>
                        <Text style={styles.activeScopeEmptyText}>No workspace loaded yet</Text>
                    </View>
                )}

                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner}>
                    {sections.map((section) => (
                        <MenuSection key={section.key} title={section.title}>
                            {section.items.map((item) => (
                                <MenuItem
                                    key={item.route}
                                    icon={item.icon}
                                    label={item.label}
                                    onPress={() => go(item.route)}
                                    active={currentRouteName === item.route}
                                    danger={item.danger}
                                />
                            ))}
                        </MenuSection>
                    ))}
                </ScrollView>

                <View style={styles.bottomBlock}>
                    <MenuItem
                        icon={LogOut}
                        label="Cerrar sesion"
                        danger
                        onPress={() => {
                            closeMenu();
                            logout();
                        }}
                    />

                    <Text style={styles.versionText}>• Starter Template •</Text>
                </View>
            </Animated.View>
        </View>
    );
}

type MenuSectionProps = {
    title: string;
    children: React.ReactNode;
};

function MenuSection({ title, children }: MenuSectionProps) {
    return (
        <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>{title}</Text>
            <View style={styles.sectionItems}>{children}</View>
        </View>
    );
}

type MenuItemProps = {
    icon: MenuIcon;
    label: string;
    onPress: () => void;
    active?: boolean;
    danger?: boolean;
};

function MenuItem({ icon: Icon, label, onPress, active, danger }: MenuItemProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.menuItem,
                active && styles.menuItemActive,
                danger && styles.menuItemDanger,
                pressed && styles.menuItemPressed,
            ]}
        >
            <View style={[styles.itemIcon, active && styles.itemIconActive, danger && styles.itemIconDanger]}>
                <Icon
                    size={17}
                    color={active ? theme.colors.accent : danger ? theme.colors.danger : theme.colors.textSecondary}
                />
            </View>

            <Text style={[styles.itemLabel, active && styles.itemLabelActive, danger && styles.itemLabelDanger]}>{label}</Text>

            <ChevronRight size={14} color={active ? theme.colors.accent : '#4C648F'} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        inset: 0,
        zIndex: 1000,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.52)',
    },
    backdropTouch: {
        flex: 1,
    },
    menuContainer: {
        width: MENU_WIDTH,
        backgroundColor: theme.colors.background,
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: '#15315A',
    },
    userHeader: {
        paddingTop: 56,
        paddingHorizontal: 16,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#17345D',
        backgroundColor: '#091831',
    },
    avatarContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0D2244',
        borderWidth: 1,
        borderColor: '#1F3765',
    },
    userMeta: {
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        marginTop: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#23487A',
        backgroundColor: '#0D2244',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    roleText: {
        fontSize: 10,
        fontWeight: theme.weight.semibold,
        color: '#9FB4D8',
        textTransform: 'capitalize',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0E1E3A',
        borderWidth: 1,
        borderColor: '#1F3765',
    },
    activeScopeCard: {
        marginHorizontal: 14,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#0E2242',
        borderWidth: 1,
        borderColor: '#2458B3',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    activeScopeIconContainer: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#122C55',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeScopeMeta: {
        flex: 1,
        minWidth: 0,
    },
    activeScopeLabel: {
        color: '#97B0D6',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.35,
        fontWeight: theme.weight.semibold,
    },
    activeScopeName: {
        marginTop: 1,
        color: '#EAF1FF',
        fontSize: 14,
        fontWeight: theme.weight.bold,
    },
    activeScopeHint: {
        marginTop: 2,
        color: '#9FB4D8',
        fontSize: 11,
    },
    activeScopeEmpty: {
        marginHorizontal: 14,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F3765',
        backgroundColor: '#0B1B36',
    },
    activeScopeEmptyText: {
        color: '#8EA4CC',
        fontSize: 12,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 10,
    },
    scrollContentInner: {
        paddingTop: 2,
        paddingBottom: 14,
        gap: 12,
    },
    sectionWrap: {
        gap: 6,
    },
    sectionLabel: {
        marginLeft: 6,
        color: '#7E94BE',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: theme.weight.semibold,
    },
    sectionItems: {
        gap: 2,
    },
    menuItem: {
        minHeight: 48,
        borderRadius: 11,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuItemPressed: {
        backgroundColor: '#112648',
    },
    menuItemActive: {
        borderWidth: 1,
        borderColor: '#2E6BFF',
        backgroundColor: '#102849',
    },
    menuItemDanger: {
        backgroundColor: '#140D16',
    },
    itemIcon: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: '#0D2244',
        borderWidth: 1,
        borderColor: '#1F3765',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemIconActive: {
        backgroundColor: '#143364',
        borderColor: '#2E6BFF',
    },
    itemIconDanger: {
        backgroundColor: '#2B1320',
        borderColor: '#5A1E2C',
    },
    itemLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: theme.weight.medium,
        color: theme.colors.textPrimary,
    },
    itemLabelActive: {
        color: '#EAF1FF',
        fontWeight: theme.weight.semibold,
    },
    itemLabelDanger: {
        color: '#FCA5A5',
    },
    bottomBlock: {
        borderTopWidth: 1,
        borderTopColor: '#17345D',
        paddingTop: 10,
        paddingHorizontal: 10,
        paddingBottom: 18,
        gap: 10,
    },
    versionText: {
        color: '#6F87B3',
        fontSize: 10,
        textAlign: 'center',
        letterSpacing: 0.4,
    },
});
