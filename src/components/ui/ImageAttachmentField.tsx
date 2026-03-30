import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

import { useImagePicker } from '@/hooks/useImagePicker';
import { theme } from '@/theme';
import ImageViewerModal from './ImageViewerModal';

export type AttachmentImage = {
  uri: string;
  name?: string;
  type?: string;
};

function normalizeAsset(asset: any): AttachmentImage | null {
  if (!asset?.uri) return null;
  return {
    uri: String(asset.uri),
    name: asset.fileName || undefined,
    type: asset.type || 'image/jpeg',
  };
}

export function ImageAttachmentField({
  title,
  helperText,
  emptyHint,
  images,
  onChange,
  maxImages = 1,
  disabled,
  loading,
}: {
  title: string;
  helperText?: string;
  emptyHint?: string;
  images: AttachmentImage[];
  onChange: (next: AttachmentImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { takePhoto, pickFromGallery } = useImagePicker();
  const [viewerImageUrl, setViewerImageUrl] = useState<string | undefined>(undefined);

  const canAddMore = images.length < Math.max(1, maxImages);
  const remainingLabel = useMemo(() => {
    if (maxImages <= 1) return undefined;
    return `${images.length}/${maxImages}`;
  }, [images.length, maxImages]);

  async function handlePick(source: 'camera' | 'gallery') {
    if (disabled || loading || !canAddMore) return;
    const asset = source === 'camera' ? await takePhoto() : await pickFromGallery();
    const normalized = normalizeAsset(asset);
    if (!normalized) return;
    onChange([...images, normalized].slice(0, maxImages));
  }

  function handleRemove(index: number) {
    if (disabled || loading) return;
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{title}</Text>
        {remainingLabel ? <Text style={styles.count}>{remainingLabel}</Text> : null}
      </View>

      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, (!canAddMore || disabled || loading) && styles.actionBtnDisabled]}
          onPress={() => handlePick('camera')}
          disabled={!canAddMore || disabled || loading}
        >
          <Camera size={14} color="#9FC0FF" />
          <Text style={styles.actionText}>Camara</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, (!canAddMore || disabled || loading) && styles.actionBtnDisabled]}
          onPress={() => handlePick('gallery')}
          disabled={!canAddMore || disabled || loading}
        >
          <ImageIcon size={14} color="#9FC0FF" />
          <Text style={styles.actionText}>Galeria</Text>
        </Pressable>
      </View>

      {images.length ? (
        <View style={styles.previewRow}>
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.thumbWrap}>
              <Pressable onPress={() => setViewerImageUrl(image.uri)}>
                <Image source={{ uri: image.uri }} style={styles.thumb} />
              </Pressable>
              <Pressable style={styles.removeBtn} onPress={() => handleRemove(index)}>
                <X size={12} color="#F0F6FF" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyHint}>{emptyHint || 'Sin imagen adjunta.'}</Text>
      )}

      <ImageViewerModal
        visible={!!viewerImageUrl}
        imageUrl={viewerImageUrl}
        onClose={() => setViewerImageUrl(undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#1A3762',
    gap: 8,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#9FB4D9',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  count: {
    color: '#8EA4CC',
    fontSize: 11,
    fontWeight: theme.weight.semibold,
  },
  helper: {
    color: '#7F95BE',
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionText: {
    color: '#9FC0FF',
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3765',
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#1B2E52',
    borderWidth: 1,
    borderColor: '#2C4C7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    color: '#6F87B3',
    fontSize: theme.font.xs,
  },
});
