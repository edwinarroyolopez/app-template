// src/modules/general-expenses/screens/GeneralExpensesScreen.tsx
import { FlatList, Pressable, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Plus, Mic, Wallet } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Screen } from '@/components/ui/Screen';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

import { useGeneralExpenses } from '../hooks/useGeneralExpenses';

import CreateGeneralExpenseModal from '../components/CreateGeneralExpenseModal';
import AudioGeneralExpenseModal from '../components/AudioGeneralExpenseModal';
import AudioPlayerModal from '../components/AudioPlayerModal';
import GeneralExpenseCard from '../components/GeneralExpenseCard';
import ImageViewerModal from '@/components/ui/ImageViewerModal';

export default function GeneralExpenseScreen() {
    const { data, isLoading, isFetching, refetch } = useGeneralExpenses();

    const [showCreate, setShowCreate] = useState(false);
    const [showAudio, setShowAudio] = useState(false);

    const [editingCost, setEditingCost] = useState<any | null>(null);
    const [audioResult, setAudioResult] = useState<any | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

    if (isLoading) {
        return (
            <MainLayout>
                <Screen>
                    <Loader message="Cargando gastos…" />
                </Screen>
            </MainLayout>
        );
    }

    const createActions = (
        <View style={styles.headerActions}>
            <Pressable
                onPress={() => setShowAudio(true)}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                hitSlop={10}
            >
                <Mic size={15} color={theme.colors.textMuted} strokeWidth={2} />
            </Pressable>
            <Pressable
                onPress={() => {
                    setEditingCost(null);
                    setShowCreate(true);
                }}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                hitSlop={10}
            >
                <Plus size={16} color={theme.colors.accent} strokeWidth={2.5} />
            </Pressable>
        </View>
    );

    return (
        <MainLayout>
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.headerWrap}>
                    <RefreshHeader
                        title="Gastos generales"
                        subtitle="Registro de gastos operativos"
                        icon={<Wallet size={18} color={theme.colors.accent} />}
                        isFetching={isFetching}
                        onRefresh={refetch}
                        helpKey="general_expenses_help"
                        actionButton={createActions}
                    />
                </View>

                {/* LIST */}
                <View style={styles.listWrapper}>
                    <FlatList
                        data={data ?? []}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <GeneralExpenseCard
                                cost={item}
                                onEdit={() => {
                                    setEditingCost(item);
                                    setShowCreate(true);
                                }}
                                onPlayAudio={
                                    item.audioUrl || item.localAudioPath
                                        ? () =>
                                            setAudioUrl(
                                                item.audioUrl ??
                                                `file://${item.localAudioPath}`,
                                            )
                                        : undefined
                                }
                                onViewImage={(imageUrl) => setViewerImageUrl(imageUrl)}
                            />
                        )}
                    />
                </View>
            </View>

            {/* AUDIO RECORD MODAL */}
            <AudioGeneralExpenseModal
                visible={showAudio}
                onClose={() => setShowAudio(false)}
                onResult={(data) => {
                    setAudioResult(data);
                    setEditingCost(null);
                    setShowCreate(true);
                }}
            />

            {/* CREATE / EDIT MODAL */}
            <CreateGeneralExpenseModal
                visible={showCreate}
                initialData={editingCost ?? audioResult ?? undefined}
                onClose={() => {
                    setShowCreate(false);
                    setEditingCost(null);
                    setAudioResult(null);
                }}
            />

            {/* AUDIO PLAYER */}
            {audioUrl && (
                <AudioPlayerModal
                    visible={!!audioUrl}
                    audioUrl={audioUrl}
                    onClose={() => setAudioUrl(null)}
                />
            )}

            <ImageViewerModal
                visible={Boolean(viewerImageUrl)}
                imageUrl={viewerImageUrl || undefined}
                onClose={() => setViewerImageUrl(null)}
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    actionBtn: {
        width: 30,
        height: 30,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
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
