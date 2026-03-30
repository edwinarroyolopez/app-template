import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Card } from '@/components/ui/Card';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { useAuthStore } from '@/stores/auth.store';
import { theme } from '@/theme';

export default function ProtectedOverviewScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <MainLayout>
      <View style={styles.page}>
        <RefreshHeader title="Starter Workspace" subtitle="Protected shell example" onRefresh={() => {}} />

        <Card>
          <View style={styles.identityRow}>
            <ShieldCheck size={16} color={theme.colors.accent} />
            <Text style={styles.identityTitle}>Authenticated Session</Text>
          </View>
          <Text style={styles.bodyText}>Name: {user?.name || 'Unknown user'}</Text>
          <Text style={styles.bodyText}>Role: {user?.role || 'No role'}</Text>
          <Text style={styles.bodyHint}>
            This screen demonstrates protected shell, header/menu/bottom-nav, offline banner and session-driven rendering.
          </Text>
        </Card>

        <Card>
          <Text style={styles.blockTitle}>What this proves</Text>
          <Text style={styles.bodyText}>• MainLayout works as shared protected shell.</Text>
          <Text style={styles.bodyText}>• Zustand auth store is consumed without domain coupling.</Text>
          <Text style={styles.bodyText}>• Starter can grow modules from this baseline.</Text>
        </Card>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 14, gap: 10 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  identityTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.md },
  bodyText: { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 },
  bodyHint: { color: '#8EA4CC', fontSize: 12, lineHeight: 18, marginTop: 2 },
  blockTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.sm, marginBottom: 6 },
});
