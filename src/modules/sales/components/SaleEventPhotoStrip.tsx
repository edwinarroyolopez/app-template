import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

type SaleEventPhoto = {
  url: string;
  thumbnailUrl?: string;
};

type Props = {
  photos?: SaleEventPhoto[];
  onPhotoPress?: (url: string) => void;
  size?: number;
};

export function SaleEventPhotoStrip({ photos, onPhotoPress, size = 58 }: Props) {
  if (!photos?.length) return null;

  return (
    <View style={styles.row}>
      {photos.map((photo, idx) => {
        const photoUrl = photo.thumbnailUrl || photo.url;
        return (
          <Pressable
            key={`${photo.url}-${idx}`}
            onPress={() => onPhotoPress?.(photo.url)}
            disabled={!onPhotoPress}
          >
            <Image source={{ uri: photoUrl }} style={[styles.photo, { width: size, height: size }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photo: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F3765',
  },
});
