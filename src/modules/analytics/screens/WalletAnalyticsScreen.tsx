import { View, Text, StyleSheet } from 'react-native';
import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { useRequireActiveWorkspaceContext } from '@/quarantine/legacy-domain/modules/workspace-directory/hooks/useRequireActiveWorkspaceContext';

export default function WalletAnalyticsScreen() {
    const activeWorkspaceContext = useRequireActiveWorkspaceContext();

    if (!activeWorkspaceContext) return null;

    return (
        <MainLayout>
            <View style={styles.centered}>
                <Text style={styles.text}>Analitica de wallets</Text>
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
    },
});
