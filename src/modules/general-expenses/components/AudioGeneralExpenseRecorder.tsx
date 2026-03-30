// src/modules/operational-costs/components/AudioCostRecorder.tsx
import { Pressable, Text, NativeModules } from 'react-native';
import { useState } from 'react';
import { Mic, Square } from 'lucide-react-native';
import { theme } from '@/theme';

const { AudioRecorder } = NativeModules;

type Props = {
    onRecorded: (file: {
        uri: string;
        name: string;
        type: string;
    }) => void;
};

export function AudioGeneralExpenseRecorder({ onRecorded }: Props) {
    const [recording, setRecording] = useState(false);

    async function start() {
        setRecording(true);
        await AudioRecorder.start();
    }

    async function stop() {
        const uri: string = await AudioRecorder.stop();
        setRecording(false);

        if (!uri) return;

        onRecorded({
            uri: `file://${uri}`,
            name: 'general-expense.m4a',
            type: 'audio/m4a',
        });
    }

    return (
        <Pressable
            onPress={recording ? stop : start}
            style={{
                marginTop: theme.spacing.md,
                padding: 14,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surfaceSoft,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
            }}
        >
            {recording ? (
                <>
                    <Square size={18} color={theme.colors.danger} />
                    <Text style={{ color: theme.colors.textPrimary }}>
                        Detener grabación
                    </Text>
                </>
            ) : (
                <>
                    <Mic size={18} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.textPrimary }}>
                        Grabar audio
                    </Text>
                </>
            )}
        </Pressable>
    );
}
