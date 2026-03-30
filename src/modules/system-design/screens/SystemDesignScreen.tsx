import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Layers, ShieldCheck, Sparkles } from 'lucide-react-native';

import { StarterSurface } from '@/components/StarterSurface/StarterSurface';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { LimitBanner } from '@/components/LimitBanner/LimitBanner';
import { CapabilityGate } from '@/components/CapabilityGate/CapabilityGate';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { theme } from '@/theme';

type CatalogCategory =
  | 'ui'
  | 'modals'
  | 'help'
  | 'uploads'
  | 'feedback'
  | 'forms'
  | 'navigation'
  | 'shell'
  | 'layout'
  | 'legacy-cleanup';

type CatalogItem = {
  name: string;
  path: string;
  classification: 'ui' | 'component' | 'shell';
  status: 'stable' | 'needs-review' | 'legacy-replaced' | 'example-only';
  category: CatalogCategory;
  variants: string[];
  props: string[];
  usage: string[];
  antiPatterns: string[];
  mergedFrom?: string[];
};

const CATEGORIES: CatalogCategory[] = [
  'ui',
  'modals',
  'help',
  'uploads',
  'feedback',
  'forms',
  'navigation',
  'shell',
  'layout',
  'legacy-cleanup',
];

const RULES = [
  'ui = primitives only. No domain stores, no API decisions.',
  'Reusable non-primitive = src/components/<ComponentName>.',
  'Shell stays explicit: MainLayout/AppHeader/AppMenu/BottomBar.',
  'New modal flows must start from OperationalModal.',
  'Uploads must use ImageAttachmentField before creating variants.',
  'Merge near-duplicates before adding new components.',
  'Public showcases must use local/demo-safe data only.',
  'Protected screens must compose from shared components, not fork them.',
];

const CATALOG: CatalogItem[] = [
  {
    name: 'Input',
    path: 'src/components/ui/Input.tsx',
    classification: 'ui',
    status: 'stable',
    category: 'forms',
    variants: ['default', 'error'],
    props: ['value', 'onChangeText', 'error', 'keyboardType'],
    usage: ['Use in all forms as baseline text field.'],
    antiPatterns: ['Do not embed domain validation rules inside a primitive UI component.'],
  },
  {
    name: 'Button',
    path: 'src/components/ui/Button.tsx',
    classification: 'ui',
    status: 'stable',
    category: 'ui',
    variants: ['primary', 'secondary', 'ghost', 'danger'],
    props: ['label', 'onPress', 'variant', 'disabled'],
    usage: ['Use one primary CTA per surface and secondary for fallback.'],
    antiPatterns: ['Avoid stacking multiple primary CTAs side by side.'],
  },
  {
    name: 'OperationalModal',
    path: 'src/components/ui/OperationalModal.tsx',
    classification: 'ui',
    status: 'stable',
    category: 'modals',
    variants: ['center', 'bottom-sheet'],
    props: ['visible', 'onClose', 'title', 'footer', 'scrollable'],
    usage: ['Single modal shell for reusable operational dialogs.'],
    antiPatterns: ['Do not build duplicate full-screen modal shells per module.'],
    mergedFrom: ['PurchasePayment modal shell', 'CreateTransaction modal shell'],
  },
  {
    name: 'ImageAttachmentField',
    path: 'src/components/ui/ImageAttachmentField.tsx',
    classification: 'ui',
    status: 'stable',
    category: 'uploads',
    variants: ['single image', 'multi image'],
    props: ['images', 'onChange', 'maxImages', 'disabled'],
    usage: ['Canonical image uploader for forms and evidence fields.'],
    antiPatterns: ['Do not recreate camera/gallery uploaders in modules.'],
    mergedFrom: ['ReceiptImagePicker', 'PurchaseEvidenceUploader', 'SaleEvidenceUploader'],
  },
  {
    name: 'RefreshHeader',
    path: 'src/components/RefreshHeader/RefreshHeader.tsx',
    classification: 'component',
    status: 'stable',
    category: 'help',
    variants: ['title+subtitle', 'compact', 'with helpKey'],
    props: ['title', 'subtitle', 'onRefresh', 'helpKey'],
    usage: ['Header pattern for operational lists and detail surfaces.'],
    antiPatterns: ['Avoid screen-specific refresh headers with duplicated animation code.'],
  },
  {
    name: 'LimitBanner',
    path: 'src/components/LimitBanner/LimitBanner.tsx',
    classification: 'component',
    status: 'stable',
    category: 'feedback',
    variants: ['informative', 'near limit + CTA'],
    props: ['show', 'title', 'subtitle', 'icon', 'nearLimit'],
    usage: ['Shared warning banner for usage limits and account constraints.'],
    antiPatterns: ['Avoid custom warning bars that bypass this baseline style.'],
  },
  {
    name: 'CapabilityGate',
    path: 'src/components/CapabilityGate/CapabilityGate.tsx',
    classification: 'component',
    status: 'needs-review',
    category: 'feedback',
    variants: ['lock', 'blur', 'teaser', 'upgradeCTA'],
    props: ['capability', 'mode', 'showUpgrade'],
    usage: ['Generic access gating wrapper for protected actions.'],
    antiPatterns: ['Do not use frontend gate as backend security replacement.'],
  },
  {
    name: 'MainLayout',
    path: 'src/components/MainLayout/MainLayout.tsx',
    classification: 'shell',
    status: 'stable',
    category: 'layout',
    variants: ['default', 'hideHeader', 'hideBottomBar'],
    props: ['children', 'hideHeader', 'hideBottomBar'],
    usage: ['Protected shell baseline with offline and startup bridges.'],
    antiPatterns: ['Do not create parallel app layouts with competing responsibilities.'],
  },
  {
    name: 'Navigation Shell',
    path: 'src/components/AppMenu + src/components/BottomBar',
    classification: 'shell',
    status: 'stable',
    category: 'navigation',
    variants: ['menu', 'bottom bar'],
    props: ['registry-driven sections and tabs'],
    usage: ['Route exposure is centralized via menu and bottom-bar registries.'],
    antiPatterns: ['Do not hardcode scattered feature-route rules in visual layer.'],
  },
  {
    name: 'Legacy Cleanup',
    path: 'src/hooks/useOperationalSyncBridge.ts',
    classification: 'shell',
    status: 'legacy-replaced',
    category: 'legacy-cleanup',
    variants: ['single bridge hook'],
    props: ['-'],
    usage: ['Startup sync bridge kept generic for starter phase.'],
    antiPatterns: ['No parallel useSync* clones with same NetInfo logic.'],
    mergedFrom: ['useSyncSales', 'useSyncPurchases', 'useSyncInventory', 'useSyncWorkspaceContexts', 'useSyncProviders'],
  },
];

export default function SystemDesignScreen() {
  const [category, setCategory] = useState<CatalogCategory>('ui');
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<AttachmentImage[]>([]);

  const items = useMemo(() => CATALOG.filter((item) => item.category === category), [category]);

  return (
    <StarterSurface>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Sparkles size={13} color={theme.colors.accent} />
          <Text style={styles.heroBadgeText}>System Design</Text>
        </View>
        <Text style={styles.heroTitle}>Reusable components and shell, with strict ownership.</Text>
        <Text style={styles.heroText}>
          This is the canonical runtime showcase for starter quality: contracts, previews, anti-patterns and cleanup history.
        </Text>
      </View>

      <Card>
        <Text style={styles.blockTitle}>Rules</Text>
        {RULES.map((rule) => (
          <Text key={rule} style={styles.rule}>• {rule}</Text>
        ))}
      </Card>

      <View style={styles.categoryWrap}>
        {CATEGORIES.map((entry) => {
          const active = entry === category;
          return (
            <Pressable key={entry} style={[styles.categoryChip, active && styles.categoryChipActive]} onPress={() => setCategory(entry)}>
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{entry}</Text>
            </Pressable>
          );
        })}
      </View>

      {items.map((item) => (
        <Card key={item.name}>
          <View style={styles.headRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.classification} • {item.status}</Text>
          </View>
          <Text style={styles.path}>{item.path}</Text>

          <Text style={styles.label}>Preview</Text>
          <Preview item={item} modalVisible={modalVisible} setModalVisible={setModalVisible} images={images} setImages={setImages} />

          <Text style={styles.label}>Variants</Text>
          <Text style={styles.text}>{item.variants.join(' • ')}</Text>
          <Text style={styles.label}>Props</Text>
          <Text style={styles.text}>{item.props.join(' • ')}</Text>
          <Text style={styles.label}>Usage</Text>
          <Text style={styles.text}>{item.usage.join(' ')}</Text>
          <Text style={styles.label}>Anti-patterns</Text>
          <Text style={styles.text}>{item.antiPatterns.join(' ')}</Text>
          {item.mergedFrom?.length ? <Text style={styles.merge}>Merged from: {item.mergedFrom.join(', ')}</Text> : null}
        </Card>
      ))}

      <Card>
        <Text style={styles.blockTitle}>Legacy / Cleanup</Text>
        <Text style={styles.text}>Removed: legacy domain routes from protected stack, sync wrappers, module upload duplicates.</Text>
        <Text style={styles.text}>Consolidated: canonical component folders + registry-driven shell navigation.</Text>
        <Text style={styles.text}>
          Example-domain semantics live under src/quarantine/legacy-domain/; the starter shell uses workspace scope from auth.store only.
        </Text>
      </Card>
    </StarterSurface>
  );
}

function Preview({
  item,
  modalVisible,
  setModalVisible,
  images,
  setImages,
}: {
  item: CatalogItem;
  modalVisible: boolean;
  setModalVisible: (next: boolean) => void;
  images: AttachmentImage[];
  setImages: (next: AttachmentImage[]) => void;
}) {
  if (item.name === 'Input') {
    return <Input value="Demo input" onChangeText={() => {}} />;
  }

  if (item.name === 'Button') {
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
      </View>
    );
  }

  if (item.name === 'OperationalModal') {
    return (
      <>
        <Button label="Open modal preview" variant="secondary" onPress={() => setModalVisible(true)} />
        <OperationalModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Operational Modal" subtitle="Canonical shell">
          <Text style={styles.text}>Reusable modal contract with slots.</Text>
        </OperationalModal>
      </>
    );
  }

  if (item.name === 'ImageAttachmentField') {
    return <ImageAttachmentField title="Attachment" images={images} onChange={setImages} maxImages={2} helperText="Demo-safe local data" />;
  }

  if (item.name === 'RefreshHeader') {
    return <RefreshHeader title="Orders" subtitle="22 active" onRefresh={() => {}} />;
  }

  if (item.name === 'LimitBanner') {
    return <LimitBanner show title="Usage near limit" subtitle="8/10 consumed" nearLimit icon={<ShieldCheck size={14} color="#7C2D12" />} />;
  }

  if (item.name === 'CapabilityGate') {
    return (
      <CapabilityGate capability={{ enabled: false, reason: 'PREMIUM_REQUIRED' }} mode="upgradeCTA">
        <Text>Locked block</Text>
      </CapabilityGate>
    );
  }

  if (item.name === 'Legacy Cleanup') {
    return <Loader fullscreen={false} message="Single sync bridge active" />;
  }

  return (
    <View style={styles.shellPreview}>
      <Layers size={15} color={theme.colors.accent} />
      <Text style={styles.text}>Shell preview represented in protected flow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderColor: '#1A345E',
    borderRadius: 16,
    backgroundColor: '#09172D',
    padding: 14,
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#27579A',
    backgroundColor: '#102344',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: { color: '#C9DDFF', fontSize: 11, fontWeight: theme.weight.semibold },
  heroTitle: { color: '#F3F8FF', fontSize: 21, lineHeight: 28, fontWeight: theme.weight.bold },
  heroText: { color: '#A4BBDF', fontSize: 13, lineHeight: 19 },
  blockTitle: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.md, marginBottom: 8 },
  rule: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 4 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#244875',
    borderRadius: 999,
    backgroundColor: '#0D1D36',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipActive: { borderColor: theme.colors.accent, backgroundColor: '#14315D' },
  categoryText: { color: '#8EA4CC', fontSize: 11 },
  categoryTextActive: { color: theme.colors.accent, fontWeight: theme.weight.bold },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  itemName: { color: theme.colors.textPrimary, fontWeight: theme.weight.bold, fontSize: theme.font.md },
  itemMeta: { color: '#8EA4CC', fontSize: 11 },
  path: { color: theme.colors.accent, fontSize: 11, marginTop: 4, marginBottom: 8 },
  label: { color: theme.colors.textPrimary, fontWeight: theme.weight.semibold, fontSize: 12, marginTop: 6, marginBottom: 2 },
  text: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
  merge: { marginTop: 6, color: '#8FB8FF', fontSize: 11 },
  shellPreview: {
    borderWidth: 1,
    borderColor: '#244875',
    borderRadius: 10,
    backgroundColor: '#0D1D36',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
