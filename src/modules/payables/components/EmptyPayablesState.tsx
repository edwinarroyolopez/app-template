// src/modules/payables/components/EmptyPayablesState.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Coins, FileText, Plus } from 'lucide-react-native';
import { theme } from '@/theme';

type Props = {
    onCreatePress?: () => void;
};

export default function EmptyPayablesState({ onCreatePress }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <FileText size={theme.spacing.lg * 2} color={theme.colors.textMuted} />
            </View>
            <View style={styles.titleRow}>
                <Coins size={14} color={theme.colors.accent} />
                <Text style={styles.title}>Sin cuentas por pagar</Text>
            </View>
            <Text style={styles.subtitle}>
                Registra una nueva cuenta para empezar el seguimiento de tus obligaciones.
            </Text>
            {onCreatePress && (
                <Pressable
                    onPress={onCreatePress}
                    style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
                >
                    <Plus size={14} color={theme.colors.accent} />
                    <Text style={styles.createBtnText}>Nueva cuenta</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xl,
    },
    iconContainer: {
        width: theme.spacing.xl * 3,
        height: theme.spacing.xl * 3,
        borderRadius: theme.spacing.xl * 2,
        backgroundColor: theme.colors.surfaceSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.sm,
    },
    title: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.font.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: theme.font.lg,
        marginBottom: theme.spacing.lg,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.accent,
    },
    createBtnText: {
        fontSize: theme.font.sm,
        fontWeight: theme.weight.semibold,
        color: theme.colors.accent,
    },
    pressed: {
        opacity: 0.7,
    },
});
