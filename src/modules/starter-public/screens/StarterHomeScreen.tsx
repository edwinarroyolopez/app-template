import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRight, Compass, Lock, Sparkles } from 'lucide-react-native';

import { StarterSurface } from '@/components/StarterSurface/StarterSurface';
import { Card } from '@/components/ui/Card';
import { theme } from '@/theme';
import type { PublicStackParamList } from '@/navigation/PublicNavigator';

type Props = NativeStackScreenProps<PublicStackParamList, 'StarterHome'>;

export default function StarterHomeScreen({ navigation }: Props) {
  return (
    <StarterSurface>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Sparkles size={14} color={theme.colors.accent} />
          <Text style={styles.badgeText}>Starter App</Text>
        </View>
        <Text style={styles.title}>A clean mobile starter, ready to extend.</Text>
        <Text style={styles.subtitle}>
          This template keeps auth, shell, Zustand, offline/update guards and a reusable component
          system without dragging legacy sample domains into the starter shell.
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Primary Path</Text>
        <Pressable style={styles.primaryCta} onPress={() => navigation.navigate('SystemDesign')}>
          <View style={styles.ctaLeft}>
            <Compass size={16} color="#03111F" />
            <Text style={styles.primaryCtaText}>Open System Design</Text>
          </View>
          <ArrowRight size={16} color="#03111F" />
        </Pressable>
        <Text style={styles.hint}>Start here to understand reusable components and composition rules.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Architecture</Text>
        <Pressable style={styles.secondaryCta} onPress={() => navigation.navigate('StarterArchitecture')}>
          <Text style={styles.secondaryCtaText}>Open Architecture Guide</Text>
          <ArrowRight size={16} color={theme.colors.accent} />
        </Pressable>
        <Text style={styles.hint}>Folder ownership, state rules and extension conventions.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Authentication Flow</Text>
        <Pressable style={styles.secondaryCta} onPress={() => navigation.navigate('AuthFlow')}>
          <View style={styles.ctaLeft}>
            <Lock size={14} color={theme.colors.accent} />
            <Text style={styles.secondaryCtaText}>Go to Auth</Text>
          </View>
          <ArrowRight size={16} color={theme.colors.accent} />
        </Pressable>
        <Text style={styles.hint}>Phone + OTP flow keeps the starter realistic for production extensions.</Text>
      </Card>
    </StarterSurface>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderColor: '#1A345E',
    backgroundColor: '#09172D',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#27579A',
    borderRadius: 999,
    backgroundColor: '#102344',
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: '#C9DDFF',
    fontWeight: theme.weight.semibold,
  },
  title: {
    color: '#F3F8FF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    color: '#A4BBDF',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
    marginBottom: 10,
  },
  primaryCta: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaText: {
    color: '#03111F',
    fontWeight: theme.weight.bold,
    fontSize: 13,
  },
  secondaryCta: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A4E84',
    backgroundColor: '#0D1D36',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryCtaText: {
    color: theme.colors.accent,
    fontWeight: theme.weight.semibold,
    fontSize: 13,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hint: {
    marginTop: 8,
    color: '#8EA4CC',
    fontSize: 12,
    lineHeight: 18,
  },
});
