import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { theme } from '@/theme';

type Props = {
    show: boolean;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    nearLimit?: boolean;
    onUpgradePress?: () => void;
};

export function LimitBanner({
    show,
    title,
    subtitle,
    icon,
    nearLimit = false,
    onUpgradePress,
}: Props) {
    const navigation = useNavigation<any>();

    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animation, {
            toValue: show ? 1 : 0,
            duration: 280,
            useNativeDriver: false,
        }).start();
    }, [animation, show]);

    const height = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 58],
    });

    if (!show) return null;

    function goUpgrade() {
        if (onUpgradePress) {
            onUpgradePress();
            return;
        }

        try {
            navigation.navigate('ProtectedStates');
        } catch {
        }
    }

    return (
        <Animated.View style={[styles.container, { height, opacity: animation }]}>
            <View style={styles.content}>
                <View style={styles.iconBox}>
                    {icon}
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                </View>

                {nearLimit && (
                    <Pressable onPress={goUpgrade} style={styles.upgradePill}>
                        <Crown size={12} color="#000" />
                        <Text style={styles.upgradeText}>Upgrade</Text>
                    </Pressable>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FEE2E2',
        borderBottomWidth: 1,
        borderBottomColor: '#FCA5A5',
        overflow: 'hidden',
    },
    content: {
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FECACA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#7C2D12',
    },
    subtitle: {
        fontSize: 11,
        color: '#991B1B',
    },
    upgradePill: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    upgradeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000',
    },
});
