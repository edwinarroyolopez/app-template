// src/components/ui/RefreshHeader.tsx
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { RefreshCw, Info } from 'lucide-react-native';
import { useRef, useEffect } from 'react';
import { theme } from '@/theme';
import { useHelpStore } from '@/stores/help.store';
import type { HelpContentKey } from '@/components/GlobalHelpModal/help-content';

type Props = {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    isFetching?: boolean;
    onRefresh: () => void;
    helpKey?: HelpContentKey;
    hideTitleSection?: boolean;
    actionButton?: React.ReactNode; // acción compacta integrada (ej: botón +)
};

export function RefreshHeader({
    title,
    subtitle,
    icon,
    isFetching = false,
    onRefresh,
    helpKey,
    hideTitleSection = false,
    actionButton,
}: Props) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const helpStore = useHelpStore();

    useEffect(() => {
        if (isFetching) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ).start();
        } else {
            rotateAnim.stopAnimation();
            rotateAnim.setValue(0);
        }
    }, [isFetching, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    const showTitleSection = !hideTitleSection && (title || subtitle || icon);

    function handleRefresh() {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();

        onRefresh();
    }

    return (
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: showTitleSection ? 'space-between' : 'flex-end',
                }}
            >
                {showTitleSection && (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {icon}
                        <View style={{ flex: 1, minWidth: 0 }}>
                            {title && (
                                <Text
                                    style={{
                                        fontSize: theme.font.lg,
                                        fontWeight: theme.weight.bold,
                                        color: theme.colors.textPrimary,
                                    }}
                                >
                                    {title}
                                </Text>
                            )}

                            {subtitle && (
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={{
                                        marginTop: title ? 2 : 0,
                                        fontSize: theme.font.sm,
                                        color: theme.colors.textSecondary,
                                    }}
                                >
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {actionButton}

                    {helpKey && (
                        <Pressable
                            onPress={() => helpStore.show(helpKey)}
                            style={{
                                padding: 6,
                                borderRadius: 20,
                            }}
                            hitSlop={10}
                        >
                            <Info
                                size={18}
                                color={theme.colors.accent}
                                strokeWidth={2.5}
                            />
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handleRefresh}
                        disabled={isFetching}
                        style={{
                            padding: 6,
                            borderRadius: 20,
                            opacity: isFetching ? 0.6 : 1,
                        }}
                    >
                        <Animated.View
                            style={{
                                transform: [
                                    { scale: scaleAnim },
                                    { rotate },
                                ],
                            }}
                        >
                            <RefreshCw
                                size={18}
                                color={theme.colors.textPrimary}
                            />
                        </Animated.View>
                    </Pressable>
                </View>
            </View>

        </View>
    );
}
