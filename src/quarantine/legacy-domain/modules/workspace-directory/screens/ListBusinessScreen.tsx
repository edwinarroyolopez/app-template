// quarantine/legacy-domain/modules/workspace-directory/screens/ListBusinessScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
} from 'react-native';
import { ArrowLeft, Info, Plus, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useOperationalWorkspaceContextStore } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { useAuthStore } from '@/stores/auth.store';
import { useSelectWorkspace } from '../hooks/useSelectWorkspace';
import { useMyWorkspaces } from '../hooks/useMyWorkspaces';

import { theme } from '@/theme';
import { MainLayout } from '@/components/MainLayout/MainLayout';
import { CreateBusinessModal } from '../components/CreateBusinessModal';
import BusinessCard from '../components/BusinessCard';
import { WorkspacesLimitBanner } from '../components/WorkspacesLimitBanner';
import { useHelpStore } from '@/stores/help.store';

export default function ListBusinessScreen() {
    const { isLoading, refetch, isRefetching } = useMyWorkspaces();
    const navigation = useNavigation<any>();

    const workspaceContexts = useOperationalWorkspaceContextStore((s) => s.workspaceContexts);
    const activeWorkspaceContext = useOperationalWorkspaceContextStore((s) => s.activeWorkspaceContext);

    const user = useAuthStore((s) => s.user);
    const showHelp = useHelpStore((s) => s.show);
    const selectWorkspaceContext = useSelectWorkspace();
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');
    const canGoBack = navigation.canGoBack();

    const activeWorkspaceId = activeWorkspaceContext?.workspace?.id ?? '';

    const filteredContexts = workspaceContexts.filter((ctx) => {
        const unit = ctx.workspace;
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return (
            unit.name?.toLowerCase().includes(query) ||
            unit.address?.toLowerCase().includes(query)
        );
    });

    return (
        <MainLayout hideHeader hideBottomBar>
            <View
                style={styles.container}
            >
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        {canGoBack ? (
                            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                                <ArrowLeft size={18} color="#DCE8FF" />
                            </Pressable>
                        ) : null}
                        <Text style={styles.headerTitle}>Seleccionar Local</Text>
                    </View>

                    <View style={styles.headerActions}>
                        <Pressable
                            onPress={() => showHelp('select_workspace_help')}
                            style={styles.helpButton}
                            hitSlop={10}
                        >
                            <Info size={18} color={theme.colors.accent} strokeWidth={2.5} />
                        </Pressable>

                        {user?.role === 'OWNER' && (
                            <Pressable
                                onPress={() => setShowCreate(true)}
                                style={styles.addButton}
                            >
                                <Plus size={22} color="#F0F6FF" />
                            </Pressable>
                        )}
                    </View>
                </View>

                <Text style={styles.subtitle}>Toca un workspace para continuar</Text>

                <View style={styles.searchWrap}>
                    <Search size={18} color="#8EA4CC" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar local por nombre o ciudad..."
                        placeholderTextColor="#7E94BE"
                        style={styles.searchInput}
                    />
                </View>


                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>WORKSPACES DISPONIBLES</Text>
                </View>

                <WorkspacesLimitBanner />

                <FlatList
                    data={filteredContexts}
                    keyExtractor={(item) => item.workspace.id}
                    renderItem={({ item }) => (
                        <BusinessCard
                            item={item}
                            onPress={selectWorkspaceContext}
                            selected={item.workspace.id === activeWorkspaceId}
                            isPrimary={item.workspace.id === workspaceContexts[0]?.workspace?.id}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={theme.colors.accent}
                        />
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyTitle}>
                                    No encontramos locales
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    Prueba con otro nombre o ciudad.
                                </Text>
                            </View>
                        ) : null
                    }
                />

                <Text style={styles.footnote}>No ves tu local? Contacta con el administrador.</Text>

                <CreateBusinessModal
                    visible={showCreate}
                    onClose={() => setShowCreate(false)}
                />
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 16,
        backgroundColor: '#040C1E',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1C3566',
        backgroundColor: '#09162F',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    helpButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#09162F',
        borderWidth: 1,
        borderColor: '#1C3566',
    },
    headerTitle: {
        fontSize: theme.font.xl,
        fontWeight: theme.weight.bold,
        color: '#EAF1FF',
    },
    subtitle: {
        marginBottom: 12,
        color: '#8EA4CC',
        fontSize: theme.font.sm,
    },
    addButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#2E6BFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchWrap: {
        height: 42,
        borderRadius: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#1F3765',
        backgroundColor: '#0A1835',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: '#DCE8FF',
        fontSize: theme.font.md,
    },
    sectionHeader: {
        marginBottom: 8,
    },
    sectionTitle: {
        color: '#8EA4CC',
        fontSize: 13,
        letterSpacing: 1,
        fontWeight: theme.weight.semibold,
    },
    listContent: {
        paddingBottom: 8,
    },
    emptyWrap: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        marginTop: 10,
        color: '#DCE8FF',
        fontSize: theme.font.md,
        fontWeight: theme.weight.semibold,
    },
    emptySubtitle: {
        marginTop: 6,
        color: '#8EA4CC',
        fontSize: theme.font.sm,
    },
    footnote: {
        marginTop: 8,
        marginBottom: 12,
        textAlign: 'center',
        color: '#7E94BE',
        fontSize: 11,
    },
});
