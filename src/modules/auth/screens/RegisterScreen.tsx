import {
    View,
    Text,
    Pressable,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useRegister } from '../hooks/useRegister';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { theme } from '@/theme';
import { ActionLoader } from '@/components/ui/ActionLoader';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [processing, setProcessing] = useState(false);
    const register = useRegister();

    async function onSubmit() {
        if (!phone.trim() || !name.trim()) return;

        try {
            setProcessing(true);

            await register.mutateAsync({ phone, name });

            setProcessing(false);
        } catch (err: any) {
            setProcessing(false);

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'No se pudo registrar';

            Toast.show({
                type: 'error',
                text1: 'Error al registrar',
                text2: message,
            });
        }
    }

    return (
        <Screen>
            <View style={{ padding: theme.spacing.lg }}>
                <Text style={{
                    fontSize: theme.font.xl,
                    fontWeight: theme.weight.bold,
                    color: theme.colors.textPrimary,
                    marginBottom: 6,
                }}>
                    Create account
                </Text>

                <Text style={{
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.lg,
                }}>
                    Starter account bootstrap
                </Text>

                <Text style={{ color: theme.colors.textMuted, marginBottom: 6 }}>
                    Name
                </Text>

                <Input
                    placeholder="Juan Operador"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={{
                    color: theme.colors.textMuted,
                    marginTop: theme.spacing.md,
                    marginBottom: 6,
                }}>
                    Phone
                </Text>

                <Input
                    placeholder="3006453020"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />

                <View style={{ marginTop: theme.spacing.lg }}>
                    <Pressable
                        onPress={onSubmit}
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
                            Register
                        </Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: theme.spacing.lg }}
                >
                    <Text style={{
                        textAlign: 'center',
                        color: theme.colors.accent,
                        fontWeight: theme.weight.semibold,
                    }}>
                        Already have an account? Back to sign in
                    </Text>
                </Pressable>
            </View>

            <ActionLoader
                visible={processing}
                steps={[
                    'Validando datos…',
                    'Creando cuenta…',
                    'Configurando sesión…',
                    'Preparando entorno…',
                ]}
            />

            <Toast />
        </Screen>
    );
}
