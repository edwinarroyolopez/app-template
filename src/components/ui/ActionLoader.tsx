// src/components/ui/ActionLoader.tsx
import { View, Text, Modal, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { theme } from '@/theme';

const DEFAULT_STEPS = [
    'Validando información…',
    'Enviando datos al servidor…',
    'Procesando operación…',
    'Actualizando registros…',
    'Finalizando…',
];

type Props = {
    visible: boolean;
    steps?: string[];
};

export function ActionLoader({
    visible,
    steps = DEFAULT_STEPS,
}: Props) {
    const [stepIndex, setStepIndex] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) {
            setStepIndex(0);
            progress.setValue(0);
            opacity.setValue(0);
            return;
        }

        // Fade in del texto
        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        const interval = setInterval(() => {
            setStepIndex((i) => {
                const next = i < steps.length - 1 ? i + 1 : i;

                Animated.timing(progress, {
                    toValue: (next + 1) / steps.length,
                    duration: 800,
                    useNativeDriver: false,
                }).start();

                return next;
            });
        }, 1400);

        return () => clearInterval(interval);
    }, [opacity, progress, steps, visible]);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(10,10,10,0.85)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 32,
                }}
            >
                <View
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: 20,
                        padding: 32,
                        width: '100%',
                        maxWidth: 320,
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.accent}
                    />

                    <Animated.Text
                        style={{
                            marginTop: 20,
                            fontSize: theme.font.md,
                            fontWeight: theme.weight.bold,
                            color: theme.colors.textPrimary,
                            textAlign: 'center',
                            opacity,
                        }}
                    >
                        {steps[stepIndex]}
                    </Animated.Text>

                    {/* Barra de progreso fake */}
                    <View
                        style={{
                            marginTop: 16,
                            height: 4,
                            width: '100%',
                            backgroundColor: theme.colors.surfaceSoft,
                            borderRadius: 4,
                            overflow: 'hidden',
                        }}
                    >
                        <Animated.View
                            style={{
                                height: 4,
                                width: progressWidth,
                                backgroundColor: theme.colors.accent,
                            }}
                        />
                    </View>

                    <Text
                        style={{
                            marginTop: 10,
                            fontSize: theme.font.xs,
                            color: theme.colors.textMuted,
                            textAlign: 'center',
                        }}
                    >
                        No cierres la app
                    </Text>
                </View>
            </View>
        </Modal>
    );
}
