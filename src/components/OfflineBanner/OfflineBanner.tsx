// src/components/offline/OfflineBanner.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { WifiOff, RefreshCcw } from 'lucide-react-native';
import { useIsOnline } from '@/hooks/useIsOnline';

export function OfflineBanner() {
    const online = useIsOnline();

    // Animación de altura para que el banner empuje el contenido suavemente
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animation, {
            toValue: online ? 0 : 1,
            duration: 300,
            useNativeDriver: false, // height y opacity no soportan native driver
        }).start();
    }, [animation, online]);

    // Altura interpolada para efecto slide-down
    const height = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 54] // Altura exacta del banner
    });

    const opacity = animation;

    return (
        <Animated.View style={[styles.container, { height, opacity }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <WifiOff size={14} color="#92400E" strokeWidth={2.5} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Modo Offline Activo</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        Los datos se sincronizarán al recuperar señal
                    </Text>
                </View>

                <Animated.View style={{
                    transform: [{
                        rotate: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                        })
                    }]
                }}>
                    <RefreshCcw size={14} color="#92400E" style={{ opacity: 0.5 }} />
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FEF3C7',
        borderBottomWidth: 1,
        borderBottomColor: '#FDE68A',
        overflow: 'hidden', // Importante para la animación de altura
    },
    content: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FDE68A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400E',
    },
    subtitle: {
        fontSize: 10,
        color: '#B45309',
    },
});
