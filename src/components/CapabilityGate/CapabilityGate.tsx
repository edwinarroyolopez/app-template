// src/capabilities/CapabilityGate.tsx

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { theme } from '@/theme';
import { getCapabilityMessage } from './getCapabilityMessage';

export type CapabilityResultLike = {
    enabled: boolean;
    reason?: string;
};

export type CapabilityGateMode =
    | 'lock'
    | 'blur'
    | 'teaser'
    | 'upgradeCTA';

type Props = {
    capability?: CapabilityResultLike;
    mode?: CapabilityGateMode;
    children: React.ReactNode;

    onUpgradePress?: () => void;
    showUpgrade?: boolean;

    secondaryActionLabel?: string;
    onSecondaryPress?: () => void;
};

export function CapabilityGate({
    capability,
    mode = 'lock',
    children,
    onUpgradePress,
    showUpgrade = true,
    secondaryActionLabel = 'Entendido',
    onSecondaryPress,
}: Props) {
    const navigation = useNavigation<any>();
    const resolvedCapability: CapabilityResultLike =
        capability && typeof capability.enabled === 'boolean'
            ? capability
            : { enabled: false, reason: 'ACCOUNT_INACTIVE' };

    if (resolvedCapability.enabled) return <>{children}</>;

    const message = getCapabilityMessage(resolvedCapability.reason);

    const handleUpgrade = () => {
        if (onUpgradePress) return onUpgradePress();
        try {
            navigation.navigate('ProtectedStates');
        } catch {
        }
    };

    const showSecondary =
        !!onSecondaryPress && mode !== 'lock';

    switch (mode) {

        case 'blur':
            return (
                <View style={styles.container}>
                    <View style={{ opacity: 0.55 }}>
                        {children}
                    </View>

                    <View style={styles.touchBlocker} pointerEvents="auto">
                        <View style={styles.overlayCard}>
                            <GateMessage message={message} />

                            {showUpgrade && <UpgradeButton onPress={handleUpgrade} />}

                            {showSecondary && (
                                <SecondaryButton
                                    label={secondaryActionLabel}
                                    onPress={onSecondaryPress}
                                />
                            )}
                        </View>
                    </View>
                </View>
            );

        case 'teaser':
            return (
                <View style={styles.container}>
                    <View style={{ opacity: 0.35 }}>
                        {children}
                    </View>

                    <View style={styles.overlaySoft} pointerEvents="auto">
                        <GateMessage message={message} />

                        {showUpgrade && <UpgradeButton onPress={handleUpgrade} />}

                        {showSecondary && (
                            <SecondaryButton
                                label={secondaryActionLabel}
                                onPress={onSecondaryPress}
                            />
                        )}
                    </View>
                </View>
            );

        case 'upgradeCTA':
            return (
                <View style={styles.centerBlock}>
                    <GateMessage message={message} />
                    {showUpgrade && <UpgradeButton onPress={handleUpgrade} />}

                    {showSecondary && (
                        <SecondaryButton
                            label={secondaryActionLabel}
                            onPress={onSecondaryPress}
                        />
                    )}
                </View>
            );

        case 'lock':
        default:
            return (
                <View style={styles.centerBlock}>
                    <GateMessage message={message} />
                    {showUpgrade && <UpgradeButton onPress={handleUpgrade} />}

                    {showSecondary && (
                        <SecondaryButton
                            label={secondaryActionLabel}
                            onPress={onSecondaryPress}
                        />
                    )}
                </View>
            );
    }
}

/* ---------- UI ---------- */

function GateMessage({ message }: { message: string }) {
    return (
        <View style={styles.messageCard}>
            <Lock size={26} color={theme.colors.accent} />
            <Text style={styles.messageText}>{message}</Text>
        </View>
    );
}

function UpgradeButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>
                Ver planes Premium
            </Text>
        </Pressable>
    );
}

function SecondaryButton({
    label,
    onPress,
}: {
    label: string;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{label}</Text>
        </Pressable>
    );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({

    container: { position: 'relative' },

    touchBlocker: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    overlayCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.accent,
        alignItems: 'center',
        gap: 12,
        maxWidth: 280,
    },

    overlaySoft: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },

    centerBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: 12,
    },

    messageCard: {
        alignItems: 'center',
        gap: 10,
        maxWidth: 260,
    },

    messageText: {
        textAlign: 'center',
        color: theme.colors.textPrimary,
        fontSize: theme.font.sm,
    },

    upgradeButton: {
        marginTop: theme.spacing.sm,
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: theme.radius.md,
    },

    upgradeText: {
        fontWeight: theme.weight.bold,
        color: '#000',
    },

    secondaryButton: {
        marginTop: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    secondaryText: {
        color: theme.colors.textSecondary,
        fontSize: theme.font.sm,
    },
});
