// src/modules/analytics/components/KPIBlock.tsx
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type Props = {
    label: string;
    value: string;
    color?: string;
};

export function KPIBlock({
    label,
    value,
    color = theme.colors.textPrimary,
}: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.label}>
                {label}
            </Text>

            <Text style={[styles.value, { color }]}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    label: {
        fontSize: theme.font.xs,
        color: theme.colors.textMuted,
    },
    value: {
        fontSize: theme.font.lg,
        fontWeight: theme.weight.bold,
        marginTop: theme.spacing.xs,
    },
});
