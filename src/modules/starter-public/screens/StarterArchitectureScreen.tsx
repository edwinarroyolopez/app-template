import { StyleSheet, Text, View } from 'react-native';
import { Database, Layers, Navigation, Package, Rocket, ShieldCheck } from 'lucide-react-native';

import { StarterSurface } from '@/components/StarterSurface/StarterSurface';
import { Card } from '@/components/ui/Card';
import { theme } from '@/theme';

function Section({
  title,
  icon,
  body,
  bullets,
}: {
  title: string;
  icon: React.ReactNode;
  body: string;
  bullets: string[];
}) {
  return (
    <Card>
      <View style={styles.sectionHead}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionBody}>{body}</Text>
      {bullets.map((bullet) => (
        <Text key={bullet} style={styles.bullet}>• {bullet}</Text>
      ))}
    </Card>
  );
}

export default function StarterArchitectureScreen() {
  return (
    <StarterSurface>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Architecture Guide</Text>
        <Text style={styles.heroText}>
          Operational map for extending this starter without losing shell consistency or component quality.
        </Text>
      </View>

      <Section
        title="Folder Ownership"
        icon={<Package size={16} color={theme.colors.accent} />}
        body="Each folder has a clear role. Keep boundaries strict to avoid accidental coupling."
        bullets={[
          'src/components/ui: primitives only (no domain logic).',
          'src/components/<Name>: reusable composed components.',
          'src/modules: domain flows and feature screens.',
          'src/navigation: route orchestration only.',
          'src/boot: startup hooks (version, push, hydration).',
        ]}
      />

      <Section
        title="State Strategy"
        icon={<Database size={16} color={theme.colors.accent} />}
        body="Use Zustand for client session/shell state and React Query for server state."
        bullets={[
          'Zustand: auth, UI toggles, active context, app update modal state.',
          'React Query: remote lists/details/mutations and cache invalidation.',
          'Do not duplicate server collections into Zustand unless required for UX bridge.',
        ]}
      />

      <Section
        title="Public vs Protected"
        icon={<Navigation size={16} color={theme.colors.accent} />}
        body="Public surfaces explain and onboard. Protected surfaces prove real app behavior with auth."
        bullets={[
          'Public: StarterHome, SystemDesign, Architecture, Auth flow.',
          'Protected: exactly 3 starter screens under shell.',
          'No hidden legacy routes in production starter path.',
        ]}
      />

      <Section
        title="Composition Rules"
        icon={<Layers size={16} color={theme.colors.accent} />}
        body="Decide component location by reusability and domain coupling, not by convenience."
        bullets={[
          'If it can be reused broadly and is primitive: ui.',
          'If reusable but composite: src/components/<Name>.',
          'If domain-specific: keep in module.',
          'Merge variants before adding another near-duplicate component.',
        ]}
      />

      <Section
        title="Shell and Guards"
        icon={<ShieldCheck size={16} color={theme.colors.accent} />}
        body="Shell remains stable: MainLayout, OfflineGate, version checks, update modal and auth context."
        bullets={[
          'Do not bypass OfflineGate for protected flows.',
          'Keep update check non-blocking.',
          'Keep capability gating generic and reusable.',
        ]}
      />

      <Section
        title="How to Extend"
        icon={<Rocket size={16} color={theme.colors.accent} />}
        body="A safe extension sequence keeps starter quality while scaling features."
        bullets={[
          '1) Define contract + module boundary.',
          '2) Reuse existing components or extend them.',
          '3) Add route + shell integration.',
          '4) Add help copy and loading/error states.',
        ]}
      />
    </StarterSurface>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderColor: '#1A345E',
    borderRadius: 14,
    backgroundColor: '#09172D',
    padding: 14,
    gap: 6,
  },
  heroTitle: {
    color: '#F3F8FF',
    fontSize: 20,
    fontWeight: theme.weight.bold,
  },
  heroText: {
    color: '#A4BBDF',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHead: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  sectionBody: {
    color: '#9FB4D8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  bullet: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
});
