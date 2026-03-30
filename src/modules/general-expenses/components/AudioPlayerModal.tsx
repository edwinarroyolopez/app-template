// src/components/audio/AudioPlayerModal.tsx
import {
    View,
    Text,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';
import { Play, Pause, X } from 'lucide-react-native';
import { theme } from '@/theme';

type Props = {
    visible: boolean;
    audioUrl: string;
    onClose: () => void;
};

export default function AudioPlayerModal({
    visible,
    audioUrl,
    onClose,
}: Props) {
    const soundRef = useRef<Sound | null>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (!visible) return;

        Sound.setCategory('Playback');

        soundRef.current = new Sound(audioUrl, undefined, (error) => {
            if (error) {
                console.error('Error loading audio', error);
            }
        });

        return () => {
            soundRef.current?.release();
            soundRef.current = null;
            setPlaying(false);
        };
    }, [visible, audioUrl]);

    function toggle() {
        if (!soundRef.current) return;

        if (playing) {
            soundRef.current.pause();
            setPlaying(false);
        } else {
            soundRef.current.play(() => {
                setPlaying(false);
            });
            setPlaying(true);
        }
    }

    function handleClose() {
        soundRef.current?.stop();
        setPlaying(false);

        onClose();

        Alert.alert(
            'Procesando audio',
            'Estamos procesando tu audio para calcular el costo.\n\nEn unos segundos podrás refrescar y ver el resultado.',
            [{ text: 'Entendido' }],
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    justifyContent: 'center',
                    padding: theme.spacing.lg,
                }}
            >
                <View
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.lg,
                        padding: theme.spacing.lg,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: theme.font.md,
                                fontWeight: theme.weight.bold,
                                color: theme.colors.textPrimary,
                            }}
                        >
                            🎧 Audio del gasto
                        </Text>

                        <Pressable onPress={handleClose}>
                            <X size={20} color={theme.colors.textMuted} />
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={toggle}
                        style={{
                            marginTop: theme.spacing.lg,
                            paddingVertical: 14,
                            borderRadius: 999,
                            backgroundColor: theme.colors.accent,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        {playing ? (
                            <Pause size={18} color="#000" />
                        ) : (
                            <Play size={18} color="#000" />
                        )}

                        <Text
                            style={{
                                color: '#000',
                                fontWeight: theme.weight.bold,
                            }}
                        >
                            {playing ? 'Pausar' : 'Reproducir'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
