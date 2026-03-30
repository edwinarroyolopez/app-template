// src/modules/auth/screens/LoginPhoneScreen.tsx
import {
    View,
    Text,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useRequestOtp } from '../hooks/useRequestOtp';

import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

export default function LoginPhoneScreen({ navigation }: Props) {
    const [phone, setPhone] = useState('');
    const requestOtp = useRequestOtp();

    const onSubmit = () => {
        if (!phone.trim()) return;

        requestOtp.mutate(phone, {
            onSuccess: (res) => {
                navigation.navigate('LoginOtp', {
                    phone,
                    otpToken: res.otpToken,
                });
            },
        });
    };

    return (
        <Screen>
            <View style={{ padding: theme.spacing.lg }}>
                <Text
                    style={{
                        fontSize: theme.font.xl,
                        fontWeight: theme.weight.bold,
                        color: theme.colors.textPrimary,
                        marginBottom: 6,
                    }}
                >
                    Sign in
                </Text>

                <Text
                    style={{
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.lg,
                    }}
                >
                    We will send a one-time code to your phone.
                </Text>

                <Text style={{ color: theme.colors.textMuted, marginBottom: 6 }}>
                    Phone
                </Text>

                <Input
                    placeholder="3006453020"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />

                <View style={{ marginTop: theme.spacing.lg }}>
                    {requestOtp.isPending ? (
                        <ActivityIndicator />
                    ) : (
                        <Pressable
                            onPress={onSubmit}
                            style={{
                                backgroundColor: theme.colors.accent,
                                paddingVertical: 14,
                                borderRadius: theme.radius.lg,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#000',
                                    textAlign: 'center',
                                    fontWeight: theme.weight.bold,
                                }}
                            >
                                Continue
                            </Text>
                        </Pressable>
                    )}
                </View>

                <Pressable
                    onPress={() => navigation.navigate('Register')}
                    style={{ marginTop: theme.spacing.lg }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: theme.colors.accent,
                            fontWeight: theme.weight.semibold,
                        }}
                    >
                        Need an account? Create one
                    </Text>
                </Pressable>
            </View>
        </Screen>
    );
}
