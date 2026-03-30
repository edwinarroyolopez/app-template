// src/modules/operational-costs/components/AudioOperationalCostModal.tsx
import {
    View,
    Text,
    Modal,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useState } from 'react';
import { Mic, Square } from 'lucide-react-native';
import { theme } from '@/theme';
import { useTranscribeGeneralExpense } from '../hooks/useTranscribeGeneralExpense';

import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Toast from 'react-native-toast-message';
import { ActionLoader } from '@/components/ui/ActionLoader';

const recorder = AudioRecorderPlayer;

type Props = {
    visible: boolean;
    onClose: () => void;
    onResult: (data: {
        amountCop?: number;
        description?: string;
        confidence: number;
    }) => void;
};

export default function AudioGeneralExpenseModal({
    visible,
    onClose,
    onResult,
}: Props) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);

    const transcribe = useTranscribeGeneralExpense();

    async function start() {
        try {
            setRecording(true);
            await recorder.startRecorder();
        } catch (error) {
            console.error(error);
            setRecording(false);
            Alert.alert(
                'Audio no disponible',
                'Asegúrate de haber aceptado los permisos de micrófono.'
            );
        }
    }

    async function stop() {
        try {
            const uri = await recorder.stopRecorder();
            recorder.removeRecordBackListener();
            setRecording(false);

            if (!uri) {
                Alert.alert('Error', 'No se pudo grabar el audio');
                return;
            }

            setProcessing(true);

            await transcribe.mutateAsync({
                uri: uri.startsWith('file://') ? uri : `file://${uri}`,
                name: 'operational-cost.m4a',
                type: 'audio/m4a',
            });

        } catch (err: any) {
            console.error(err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Error desconocido';

            Toast.show({
                type: 'error',
                text1: 'Error al procesar audio',
                text2: message,
            });

        } finally {
            setProcessing(false);
        }
    }

    // Hook separado para manejar éxito
    if (transcribe.isSuccess && transcribe.data) {
        onResult(transcribe.data);
        transcribe.reset();
        onClose();
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
                        padding: theme.spacing.lg,
                        borderRadius: theme.radius.lg,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: theme.font.lg,
                            fontWeight: theme.weight.bold,
                            color: theme.colors.textPrimary,
                            textAlign: 'center',
                        }}
                    >
                        🎙 Describe el gasto
                    </Text>

                    <Text
                        style={{
                            marginTop: 8,
                            color: theme.colors.textSecondary,
                            textAlign: 'center',
                            fontSize: theme.font.sm,
                        }}
                    >
                        Ejemplo: “Compré combustible por 250 mil pesos”
                    </Text>

                    <View style={{ marginTop: 24 }}>
                        {processing ? (
                            <View style={{ alignItems: 'center', gap: 8 }}>
                                <ActivityIndicator color={theme.colors.accent} />
                                <Text style={{ color: theme.colors.textSecondary }}>
                                    Subiendo y procesando audio…
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                onPress={recording ? stop : start}
                                style={{
                                    paddingVertical: 14,
                                    paddingHorizontal: 22,
                                    borderRadius: 999,
                                    backgroundColor: recording
                                        ? theme.colors.danger
                                        : theme.colors.accent,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                {recording ? (
                                    <>
                                        <Square size={18} color="#000" />
                                        <Text style={{ color: '#000', fontWeight: theme.weight.bold }}>
                                            Detener
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Mic size={18} color="#000" />
                                        <Text style={{ color: '#000', fontWeight: theme.weight.bold }}>
                                            Grabar
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        )}
                    </View>

                    {!processing && (
                        <Pressable onPress={onClose}>
                            <Text style={{ marginTop: 20, color: theme.colors.textMuted }}>
                                Cancelar
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>

            <ActionLoader
                visible={processing}
                steps={[
                    'Subiendo audio…',
                    'Transcribiendo voz…',
                    'Interpretando información…',
                    'Calculando monto…',
                    'Generando sugerencias…',
                ]}
            />

            <Toast />
        </Modal>
    );
}
