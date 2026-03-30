// src/modules/memberships/screens/MembershipsScreen.tsx
import { Text, FlatList, Pressable, ScrollView, StyleSheet, View, Modal } from 'react-native';
import { BadgeCheck, UserPlus, Users } from 'lucide-react-native';
import { useState } from 'react';

import { useWorkspaceMemberships } from '../hooks/useWorkspaceMemberships';
import MembershipCard from '../components/MembershipCard';
import InviteMemberModal from '../components/InviteMemberModal';
import EditMembershipModal from '../components/EditMembershipModal';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';
import { useRequireActiveWorkspace } from '@/hooks/useRequireActiveWorkspace';
import { useAuthStore } from '@/stores/auth.store';
import { MembersLimitBanner } from '../components/MembersLimitBanner';
import { useUpdateMembership } from '../hooks/useUpdateMembership';

type MembershipFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

export default function MembershipsScreen() {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [toggleTarget, setToggleTarget] = useState<{
        membership: any;
        nextActive: boolean;
    } | null>(null);



    const [filter, setFilter] = useState<MembershipFilter>('ACTIVE');

    const activeWorkspaceId = useRequireActiveWorkspace();
    const activeWorkspaceName = useAuthStore((s) => {
        const id = s.activeWorkspaceId;
        if (!id) return '';
        return s.workspaces.find((w) => w.id === id)?.name ?? '';
    });
    const updateMembership = useUpdateMembership();
    const { data, isLoading, isFetching, refetch } =
        useWorkspaceMemberships(filter);

    if (!activeWorkspaceId) return null;


    if (isLoading) {
        return (
            <MainLayout>
                <Screen>
                    <Text style={styles.loadingText}>
                        Cargando personal…
                    </Text>
                </Screen>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Screen>
                {/* ================= HEADER ================= */}
                <Card>
                    <View style={styles.headerRow}>
                        <RefreshHeader
                            title="Personal"
                            subtitle={activeWorkspaceName}
                            icon={<Users size={20} color={theme.colors.accent} />}
                            isFetching={isFetching}
                            onRefresh={refetch}
                            helpKey="memberships_help"
                        />

                        {/* INVITAR MIEMBRO */}
                        <Pressable
                            onPress={() => setInviteOpen(true)}
                            style={({ pressed }) => [styles.inviteButton, pressed && styles.pressed]}
                            hitSlop={10}
                        >
                            <UserPlus size={22} color={theme.colors.background} />
                        </Pressable>
                    </View>
                </Card>

                <MembersLimitBanner />

                <ScrollView
                    horizontal
                    style={styles.filtersScroll}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersRow}
                >
                    {[
                        { label: 'Activos', value: 'ACTIVE' },
                        { label: 'Inactivos', value: 'INACTIVE' },
                        { label: 'Todos', value: 'ALL' },
                    ].map(opt => {
                        const active = filter === opt.value;

                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => setFilter(opt.value as any)}
                                style={({ pressed }) => [
                                    styles.filterChip,
                                    active ? styles.filterChipActive : styles.filterChipIdle,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={active ? styles.filterTextActive : styles.filterTextIdle}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>


                {/* ================= LISTA ================= */}
                <Card>
                    <SectionHeader title="Membresias" />

                    {isFetching && (
                        <View style={styles.fetchingRow}>
                            <BadgeCheck size={12} color={theme.colors.accent} />
                            <Text style={styles.fetchingText}>
                                Actualizando…
                            </Text>
                        </View>
                    )}

                    <FlatList
                        data={data ?? []}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <MembershipCard
                                membership={item}
                                onEdit={() => setEditing(item)}
                                onToggleActive={(nextActive) => {
                                    if (nextActive === item.isActive) return;
                                    setToggleTarget({ membership: item, nextActive });
                                }}
                            />
                        )}
                        scrollEnabled={false}
                    />
                </Card>

                {/* ================= MODALES ================= */}
                <InviteMemberModal
                    visible={inviteOpen}
                    onClose={() => setInviteOpen(false)}
                />

                <EditMembershipModal
                    visible={!!editing}
                    membership={editing}
                    onClose={() => setEditing(null)}
                />

                <Modal visible={!!toggleTarget} transparent animationType="fade">
                    <View style={styles.confirmOverlay}>
                        <View style={styles.confirmCard}>
                            <Text style={styles.confirmTitle}>Confirmar cambio</Text>
                            <Text style={styles.confirmText}>
                                {toggleTarget?.nextActive
                                    ? '¿Activar este miembro para que vuelva a operar?'
                                    : '¿Desactivar este miembro? Podrá reactivarse después.'}
                            </Text>

                            <View style={styles.confirmActions}>
                                <Pressable
                                    onPress={() => setToggleTarget(null)}
                                    style={({ pressed }) => [styles.confirmCancelBtn, pressed && styles.pressed]}
                                >
                                    <Text style={styles.confirmCancelText}>Cancelar</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        if (!toggleTarget || updateMembership.isPending) return;

                                        updateMembership.mutate(
                                            {
                                                membershipId: toggleTarget.membership.id,
                                                data: { isActive: toggleTarget.nextActive },
                                            },
                                            {
                                                onSuccess: () => setToggleTarget(null),
                                            },
                                        );
                                    }}
                                    style={({ pressed }) => [styles.confirmPrimaryBtn, pressed && styles.pressed]}
                                >
                                    <Text style={styles.confirmPrimaryText}>
                                        {updateMembership.isPending ? 'Guardando...' : 'Confirmar'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Screen>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    loadingText: {
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inviteButton: {
        width: theme.spacing.xl + theme.spacing.sm,
        height: theme.spacing.xl + theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.sm,
    },
    filtersScroll: {
        flexGrow: 0,
        marginTop: theme.spacing.sm,
    },
    filtersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    filterChip: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
    },
    filterChipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    filterChipIdle: {
        backgroundColor: theme.colors.surfaceSoft,
        borderColor: theme.colors.border,
    },
    filterTextActive: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.bold,
        color: theme.colors.background,
    },
    filterTextIdle: {
        fontSize: theme.font.xs,
        fontWeight: theme.weight.medium,
        color: theme.colors.textPrimary,
    },
    fetchingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    fetchingText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    listContent: {
        paddingBottom: theme.spacing.lg,
        paddingTop: theme.spacing.xs,
    },
    pressed: {
        opacity: 0.86,
    },
    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    confirmCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
    },
    confirmTitle: {
        color: theme.colors.textPrimary,
        fontWeight: theme.weight.bold,
        fontSize: theme.font.md,
    },
    confirmText: {
        marginTop: theme.spacing.sm,
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
    confirmActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },
    confirmCancelBtn: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceSoft,
    },
    confirmCancelText: {
        color: theme.colors.textPrimary,
        fontWeight: theme.weight.bold,
        fontSize: theme.font.sm,
    },
    confirmPrimaryBtn: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.accent,
    },
    confirmPrimaryText: {
        color: '#000',
        fontWeight: theme.weight.bold,
        fontSize: theme.font.sm,
    },
});
