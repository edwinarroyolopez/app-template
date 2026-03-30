import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Card } from '@/components/ui/Card';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { CapabilityGate } from '@/components/CapabilityGate/CapabilityGate';
import { LimitBanner } from '@/components/LimitBanner/LimitBanner';
import { Loader } from '@/components/ui/Loader';
import { theme } from '@/theme';

export default function ProtectedStatesScreen() {
  const [showLoader, setShowLoader] = useState(false);
  const [locked, setLocked] = useState(true);

  return (
    <MainLayout>
      <View style={styles.page}>
        <RefreshHeader title="States and Gating" subtitle="Feedback, limits and lock states" onRefresh={() => {}} />

        <LimitBanner
          show
          title="Starter limit example"
          subtitle="This banner is reusable and module-agnostic."
          nearLimit
          icon={<AlertTriangle size={14} color="#7C2D12" />}
        />

        <Card>
          <Text style={styles.blockTitle}>Capability Gate</Text>
          <CapabilityGate capability={{ enabled: !locked, reason: 'PREMIUM_REQUIRED' }} mode="upgradeCTA">
            <Text style={styles.unlocked}>Unlocked content</Text>
          </CapabilityGate>
          <Pressable onPress={() => setLocked((prev) => !prev)} style={styles.inlineBtn}>
            <Text style={styles.inlineBtnText}>{locked ? 'Unlock preview' : 'Lock preview'}</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={styles.blockTitle}>Loading states</Text>
          {showLoader ? <Loader fullscreen={false} message="Syncing starter data..." /> : <Text style={styles.body}>Idle state</Text>}
          <Pressable onPress={() => setShowLoader((prev) => !prev)} style={styles.inlineBtn}>
            <Text style={styles.inlineBtnText}>{showLoader ? 'Hide loader' : 'Show loader'}</Text>
          </Pressable>
        </Card>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 14, gap: 10 },
  blockTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.sm, marginBottom: 8 },
  body: { color: theme.colors.textSecondary, fontSize: 12 },
  unlocked: { color: '#B9F5CC', fontWeight: theme.weight.semibold },
  inlineBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A4E84',
    backgroundColor: '#0D1D36',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  inlineBtnText: { color: theme.colors.accent, fontSize: 12, fontWeight: theme.weight.semibold },
});
