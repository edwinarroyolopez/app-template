// src/components/shared/GlobalHelpModal.tsx
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { PlayCircle, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { theme } from '@/theme';
import { useHelpStore } from '@/stores/help.store';

export function GlobalHelpModal() {
    const { visible, content, hide } = useHelpStore();

    if (!visible || !content) return null;

    async function openTutorial() {
        const url = content?.tutorial?.url;
        if (!url) return;

        try {
            await Linking.openURL(url);
        } catch {
            Toast.show({
                type: 'info',
                text1: 'No se pudo abrir el tutorial',
                text2: 'Intenta abrirlo desde el navegador del telefono.',
            });
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{content.title}</Text>
                        <Pressable onPress={hide} style={styles.closeBtn}>
                            <X size={20} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>

                    <Text style={styles.body}>{content.body}</Text>

                    {content.tutorial && (
                        <View style={styles.tutorialCard}>
                            {content.tutorial.description && (
                                <Text style={styles.tutorialDescription}>
                                    {content.tutorial.description}
                                </Text>
                            )}

                            <Pressable onPress={openTutorial} style={styles.tutorialButton}>
                                <PlayCircle size={15} color={theme.colors.accent} />
                                <Text style={styles.tutorialButtonText}>{content.tutorial.label}</Text>
                            </Pressable>
                        </View>
                    )}

                    <Pressable onPress={hide} style={styles.button}>
                        <Text style={styles.buttonText}>Entendido</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
        zIndex: 9999, // Asegura que esté por encima de otros modales
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 22,
        marginBottom: 12,
    },
    tutorialCard: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceSoft,
        borderRadius: 12,
        padding: 12,
        marginBottom: 18,
    },
    tutorialDescription: {
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    tutorialButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: `${theme.colors.accent}22`,
    },
    tutorialButtonText: {
        color: theme.colors.accent,
        fontWeight: '700',
        fontSize: 13,
    },
    button: {
        backgroundColor: theme.colors.accent,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontWeight: '600',
        fontSize: 14,
    },
});
