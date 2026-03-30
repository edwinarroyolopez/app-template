import {
    View,
    Text,
    Pressable,
} from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useVerifyOtp } from '../hooks/useVerifyOtp';

import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { ActionLoader } from '@/components/ui/ActionLoader';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginOtp'>;

export default function LoginOtpScreen({ route }: Props) {
    const { phone, otpToken } = route.params;
    const [code, setCode] = useState('');
    const [processing, setProcessing] = useState(false);
    const verifyOtp = useVerifyOtp();

    async function onVerify() {
        if (!code.trim()) return;

        try {
            setProcessing(true);

            await verifyOtp.mutateAsync({
                phone,
                otpToken,
                code,
            });

            setProcessing(false);
        } catch (err: any) {
            setProcessing(false);

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Código inválido';

            Toast.show({
                type: 'error',
                text1: 'Error de verificación',
                text2: message,
            });
        }
    }

    return (
        <Screen>
            <View style={{ padding: theme.spacing.lg }}>
                <Text style={{
                    fontSize: theme.font.lg,
                    fontWeight: theme.weight.bold,
                    color: theme.colors.textPrimary,
                    marginBottom: 6,
                }}>
                    Verification code
                </Text>

                <Text style={{
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.lg,
                }}>
                    Sent to {phone}
                </Text>

                <Input
                    placeholder="123456"
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                />

                <View style={{ marginTop: theme.spacing.lg }}>
                    <Pressable
                        onPress={onVerify}
                        style={{
                            backgroundColor: theme.colors.accent,
                            paddingVertical: 14,
                            borderRadius: theme.radius.lg,
                        }}
                    >
                        <Text style={{
                            color: '#000',
                            textAlign: 'center',
                            fontWeight: theme.weight.bold,
                        }}>
                            Verify
                        </Text>
                    </Pressable>
                </View>
            </View>

            <ActionLoader
                visible={processing}
                steps={[
                    'Validando código…',
                    'Verificando identidad…',
                    'Generando sesión…',
                    'Cargando entorno…',
                ]}
            />

            <Toast />
        </Screen>
    );
}
