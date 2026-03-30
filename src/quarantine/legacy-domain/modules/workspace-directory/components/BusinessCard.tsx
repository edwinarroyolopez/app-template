// quarantine/legacy-domain/modules/workspace-directory/components/BusinessCard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Building2, MapPin } from 'lucide-react-native';

import { theme } from '@/theme';
import type { OperationalWorkspaceContext } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';
import { WORKSPACE_OPERATIONAL_TYPE_LABELS } from '@/types/workspace-operational';

type Props = {
    item: OperationalWorkspaceContext;
    selected: boolean;
    isPrimary?: boolean;
    onPress: (item: OperationalWorkspaceContext) => void;
};

export default function BusinessCard({ item, selected, isPrimary, onPress }: Props) {
    const unit = item.workspace;

    return (
        <Pressable
            onPress={() => onPress(item)}
            style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.flex1}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{unit.name}</Text>
                    {isPrimary && <Text style={styles.primaryBadge}>PRINCIPAL</Text>}
                </View>

                <View style={styles.addressRow}>
                    <MapPin size={14} color={theme.colors.textMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                        {unit.address || 'Sin direccion registrada'}
                    </Text>
                </View>

                {unit.type && WORKSPACE_OPERATIONAL_TYPE_LABELS[unit.type as keyof typeof WORKSPACE_OPERATIONAL_TYPE_LABELS] && (
                    <View style={[styles.addressRow, { marginTop: 3 }]}>
                        <Building2 size={13} color={theme.colors.textMuted} />
                        <Text style={styles.metaText} numberOfLines={1}>
                            {WORKSPACE_OPERATIONAL_TYPE_LABELS[unit.type as keyof typeof WORKSPACE_OPERATIONAL_TYPE_LABELS]}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.trailingCol}>
                {selected ? <Text style={styles.activeTag}>ACTIVO</Text> : null}

                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected && <View style={styles.radioInner} />}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#081632',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: '#1F3765',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardSelected: {
        borderColor: '#2E6BFF',
        backgroundColor: '#0C1F44',
    },
    cardPressed: {
        opacity: 0.92,
    },
    flex1: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    primaryBadge: {
        fontSize: 9,
        color: '#9AB4E5',
        fontWeight: theme.weight.semibold,
        backgroundColor: '#122746',
        borderColor: '#284A77',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        flex: 1,
        fontSize: theme.font.md,
        fontWeight: theme.weight.bold,
        color: '#E8EEFF',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: '#9BAFD8',
        flex: 1,
    },
    trailingCol: {
        marginLeft: 10,
        alignItems: 'center',
        gap: 5,
    },
    activeTag: {
        fontSize: 9,
        fontWeight: theme.weight.semibold,
        color: '#9EC2FF',
        letterSpacing: 0.4,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#496591',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#2E6BFF',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2E6BFF',
    },
});
