// src/modules/general-expenses/components/GeneralExpenseCard.tsx
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import {
    Mic,
    AlertCircle,
    Edit,
    Image as ImageIcon,
    CloudCheck,
    RefreshCcw,
    CloudOff,
    Play,
} from 'lucide-react-native';
import { theme } from '@/theme';

type Props = {
    cost: any;
    onEdit: () => void;
    onPlayAudio?: () => void;
    onViewImage?: (imageUrl: string) => void;
};

export default function GeneralExpenseCard({
    cost,
    onEdit,
    onPlayAudio,
    onViewImage,
}: Props) {
    const isAudio = cost.source === 'AUDIO';
    const isReady = cost.status === 'READY';

    const syncConfig = {
        LOCAL: {
            color: theme.colors.warning,
            icon: RefreshCcw,
            label: 'Pendiente',
        },
        FAILED: {
            color: theme.colors.danger,
            icon: CloudOff,
            label: 'Error',
        },
        SYNCED: {
            color: theme.colors.success,
            icon: CloudCheck,
            label: null,
        },
    }[cost.syncStatus as 'LOCAL' | 'FAILED' | 'SYNCED'];

    const accentLeft =
        cost.syncStatus === 'SYNCED' ? undefined : syncConfig?.color;

    return (
        <View
            style={[
                styles.container,
                accentLeft
                    ? { borderLeftWidth: 3, borderLeftColor: accentLeft }
                    : styles.borderNeutral,
            ]}
        >
            {/* Row 1: descripción + sync status */}
            <View style={styles.topRow}>
                <Text style={styles.description} numberOfLines={2}>
                    {cost.description || 'Sin descripción'}
                </Text>
                {syncConfig && cost.syncStatus !== 'SYNCED' && (
                    <View style={styles.syncChip}>
                        <syncConfig.icon size={11} color={syncConfig.color} strokeWidth={2.5} />
                        {syncConfig.label && (
                            <Text style={[styles.syncLabel, { color: syncConfig.color }]}>
                                {syncConfig.label}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* Row 2: categoría + fecha */}
            <View style={styles.metaRow}>
                {cost.category ? (
                    <Text style={styles.metaText}>{cost.category.toUpperCase()}</Text>
                ) : (
                    <View />
                )}
                <Text style={styles.metaDate}>{cost.date.slice(0, 10)}</Text>
            </View>

            {/* Audio processing state (only when not ready) */}
            {isAudio && !isReady && (
                <View style={styles.audioProcessingRow}>
                    {cost.status === 'PROCESSING' ? (
                        <ActivityIndicator size="small" color={theme.colors.accent} />
                    ) : (
                        <AlertCircle size={12} color={theme.colors.danger} />
                    )}
                    <Text style={[
                        styles.audioProcessingText,
                        { color: cost.status === 'PROCESSING' ? theme.colors.accent : theme.colors.danger }
                    ]}>
                        {cost.status === 'PROCESSING' ? 'Transcribiendo…' : 'Error de transcripción'}
                    </Text>
                </View>
            )}

            {/* Row 3: monto + acciones */}
            <View style={styles.bottomRow}>
                <View style={styles.amountBlock}>
                    {isReady && (
                        <>
                            <Text style={styles.amountValue}>
                                ${cost.amountCop?.toLocaleString() || '0'}
                            </Text>
                            {isAudio && (
                                <View style={styles.sourceRow}>
                                    <Mic size={11} color={theme.colors.textMuted} />
                                    <Text style={styles.sourceLabel}>audio</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>

                <View style={styles.actions}>
                    {isAudio && cost.audioUrl && (
                        <Pressable
                            onPress={onPlayAudio}
                            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                            hitSlop={6}
                        >
                            <Play size={14} color={theme.colors.textSecondary} fill={theme.colors.textSecondary} />
                        </Pressable>
                    )}
                    {cost.receiptImage?.url && (
                        <Pressable
                            onPress={() => onViewImage?.(cost.receiptImage.url)}
                            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                            hitSlop={6}
                        >
                            <ImageIcon size={14} color={theme.colors.textSecondary} />
                        </Pressable>
                    )}
                    <Pressable
                        onPress={onEdit}
                        style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.pressed]}
                        hitSlop={6}
                    >
                        <Edit size={13} color={theme.colors.background} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderLeftWidth: 1,
    },
    borderNeutral: {
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.border,
    },
    pressed: {
        opacity: 0.75,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    description: {
        fontSize: theme.font.md,
        fontWeight: theme.weight.semibold,
        color: theme.colors.textPrimary,
        flex: 1,
        lineHeight: 21,
    },
    syncChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    syncLabel: {
        fontSize: 10,
        fontWeight: theme.weight.semibold,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    metaText: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
        letterSpacing: 0.4,
    },
    metaDate: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    audioProcessingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.sm,
    },
    audioProcessingText: {
        fontSize: theme.font.xs,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    amountBlock: {
        flex: 1,
    },
    amountValue: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        lineHeight: 22,
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    sourceLabel: {
        fontSize: 10,
        color: theme.colors.textMuted,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surfaceSoft,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionBtnPrimary: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
});
