import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RefreshHeader } from '@/components/RefreshHeader/RefreshHeader';
import { ImageAttachmentField, type AttachmentImage } from '@/components/ui/ImageAttachmentField';
import { theme } from '@/theme';

export default function ProtectedFormsScreen() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<AttachmentImage[]>([]);

  return (
    <MainLayout>
      <View style={styles.page}>
        <RefreshHeader title="Forms Playground" subtitle="Protected form composition" onRefresh={() => {}} />

        <Card>
          <Text style={styles.label}>Task title</Text>
          <Input value={title} onChangeText={setTitle} placeholder="Write a clear title" />

          <Text style={[styles.label, styles.topSpace]}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional details"
            multiline
            style={styles.notesInput}
          />

          <ImageAttachmentField
            title="Attachments"
            helperText="Demo-only local previews"
            images={images}
            onChange={setImages}
            maxImages={2}
          />

          <View style={styles.actions}>
            <Button label="Save Draft" variant="secondary" onPress={() => {}} />
            <Button label="Publish" onPress={() => {}} />
          </View>
        </Card>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 14, gap: 10 },
  label: {
    color: '#9FB4D8',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
    marginBottom: 6,
  },
  topSpace: { marginTop: 10 },
  notesInput: { minHeight: 84, textAlignVertical: 'top' },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
});
