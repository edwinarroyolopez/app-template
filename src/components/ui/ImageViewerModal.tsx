// src/components/ui/ImageViewerModal.tsx
import { Modal, Image, Pressable } from 'react-native';
import { theme } from '@/theme';

type Props = {
    visible: boolean;
    imageUrl?: string;
    onClose: () => void;
};

export default function ImageViewerModal({
    visible,
    imageUrl,
    onClose,
}: Props) {
    if (!imageUrl) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={{
                        width: '92%',
                        height: '80%',
                        borderRadius: theme.radius.md,
                    }}
                    resizeMode="contain"
                />
            </Pressable>
        </Modal>
    );
}
