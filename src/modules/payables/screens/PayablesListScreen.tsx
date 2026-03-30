// src/modules/payables/screens/PayablesListScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { FileText, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { usePayables } from '../hooks/usePayables';
import { usePayablesSummary } from '../hooks/usePayablesSummary';
import PayableCard from '../components/PayableCard';
import SummaryCard from '../components/SummaryCard';
import EmptyPayablesState from '../components/EmptyPayablesState';
import CreatePayableModal from '../components/CreatePayableModal';

import type { AppStackParamList } from '@/navigation/AppNavigator';
import type { PayableStatus } from '../types/payables.types';
import { useRequireActiveWorkspaceContext } from '@/quarantine/legacy-domain/modules/workspace-directory/hooks/useRequireActiveWorkspaceContext';
import { PAYABLE_STATUS_FILTERS } from '../utils/payablesList.constants';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function PayablesListScreen() {
    const navigation = useNavigation<Nav>();
    const activeWorkspaceContext = useRequireActiveWorkspaceContext();

    const [statusFilter, setStatusFilter] = useState<PayableStatus | undefined>(undefined);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data: payables, isLoading, isFetching, refetch } = usePayables({ status: statusFilter });
    const { data: summary, isLoading: summaryLoading } = usePayablesSummary();

    if (!activeWorkspaceContext) return null;

    if (isLoading) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Cargando cuentas por pagar…" />
                </Screen>
            </MainLayout>
        );
    }

    const createButton = (
        <Pressable
            onPress={() => setShowCreateModal(true)}
            style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
            hitSlop={10}
        >
            <Plus size={16} color={theme.colors.accent} strokeWidth={2.5} />
        </Pressable>
    );

    return (
        <MainLayout>
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.headerWrap}>
                    <RefreshHeader
                        title="Cuentas por pagar"
                        subtitle="Seguimiento de obligaciones"
                        icon={<FileText size={18} color={theme.colors.accent} />}
                        isFetching={isFetching}
                        onRefresh={refetch}
                        helpKey="payables_help"
                        actionButton={createButton}
                    />
                </View>

                {/* SUMMARY — inline pill strip */}
                <SummaryCard summary={summary} isLoading={summaryLoading} />

                {/* STATUS FILTERS */}
                <ScrollView
                    horizontal
                    style={styles.filtersScroll}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {PAYABLE_STATUS_FILTERS.map((filter) => {
                        const isActive = filter.value === statusFilter;
                        return (
                            <Pressable
                                key={filter.label}
                                onPress={() => setStatusFilter(filter.value)}
                                style={({ pressed }) => [
                                    styles.filterChip,
                                    isActive && styles.filterChipActive,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        isActive && styles.filterChipTextActive,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* LIST */}
                <View style={styles.listWrapper}>
                    {payables && payables.length > 0 ? (
                        <FlatList
                            data={payables}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <PayableCard
                                    payable={item}
                                    onPress={() =>
                                        navigation.navigate('PayableDetail', {
                                            payableId: item._id,
                                        })
                                    }
                                />
                            )}
                        />
                    ) : (
                        <EmptyPayablesState onCreatePress={() => setShowCreateModal(true)} />
                    )}
                </View>
            </View>

            {/* CREATE MODAL */}
            <CreatePayableModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrap: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.xs,
        paddingBottom: theme.spacing.xs,
    },
    createBtn: {
        width: 30,
        height: 30,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },
    filtersScroll: {
        flexGrow: 0,
    },
    filterChip: {
        paddingVertical: 5,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterChipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    filterChipText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.weight.medium,
    },
    filterChipTextActive: {
        color: theme.colors.background,
        fontWeight: theme.weight.semibold,
    },
    listWrapper: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
        flexGrow: 1,
    },
    pressed: {
        opacity: 0.7,
    },
});
