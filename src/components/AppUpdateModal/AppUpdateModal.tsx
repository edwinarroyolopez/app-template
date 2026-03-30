import { Modal, Pressable, StyleSheet, Text, View, Linking } from 'react-native';
import { Download, MessageCircle, PlayCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { useAppUpdateStore } from '@/stores/app-update.store';
import Toast from 'react-native-toast-message';

const SUPPORT_WHATSAPP_URL =
  'https://wa.me/573000000000?text=Hola%2C%20necesito%20ayuda%20para%20actualizar%20la%20app';
const UPDATE_VIDEO_URL = 'https://www.youtube.com/results?search_query=mobile+app+update+tutorial';

export function AppUpdateModal() {
  const visible = useAppUpdateStore((s) => s.visible);
  const payload = useAppUpdateStore((s) => s.payload);
  const dismissForVersion = useAppUpdateStore((s) => s.dismissForVersion);

  if (!visible || !payload) return null;

  const currentPayload = payload;

  const canDismiss = !currentPayload.forceUpdate;

  async function goToUpdate() {
    try {
      await Linking.openURL(
        currentPayload.updateUrl || 'https://example.com/app/latest',
      );
    } catch {
      Toast.show({
        type: 'info',
        text1: 'No se pudo abrir la descarga',
        text2: 'Intenta nuevamente desde tu navegador.',
      });
    }
  }

  async function openUpdateVideo() {
    try {
      await Linking.openURL(UPDATE_VIDEO_URL);
    } catch {
      Toast.show({
        type: 'info',
        text1: 'No se pudo abrir el video',
        text2: 'Intenta nuevamente desde tu navegador.',
      });
    }
  }

  async function openWhatsAppSupport() {
    try {
      await Linking.openURL(SUPPORT_WHATSAPP_URL);
    } catch {
      Toast.show({
        type: 'info',
        text1: 'No se pudo abrir WhatsApp',
        text2: 'Verifica que tengas WhatsApp instalado.',
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Download size={18} color={theme.colors.accent} />
            <Text style={styles.title}>
              {currentPayload.forceUpdate ? 'Actualización obligatoria' : 'Nueva versión disponible'}
            </Text>
          </View>

          <Text style={styles.body}>
            Tu versión: {currentPayload.currentVersion || 'desconocida'}{`\n`}
            Última versión: {currentPayload.latestVersion}
          </Text>

          {currentPayload.releaseNotes ? (
            <Text style={styles.notes}>{currentPayload.releaseNotes}</Text>
          ) : null}

          <View style={styles.helpCard}>
            <Text style={styles.helpDescription}>
              Si necesitas apoyo, mira el tutorial de actualización o escríbenos por WhatsApp.
            </Text>

            <View style={styles.helpActionsRow}>
              <Pressable onPress={openUpdateVideo} style={styles.helpActionButton}>
                <PlayCircle size={14} color={theme.colors.accent} />
                <Text style={styles.helpActionText}>Ver video</Text>
              </Pressable>

              <Pressable onPress={openWhatsAppSupport} style={styles.helpActionButton}>
                <MessageCircle size={14} color={theme.colors.accent} />
                <Text style={styles.helpActionText}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {canDismiss ? (
              <Pressable
                onPress={() => dismissForVersion(currentPayload.latestVersion)}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Más tarde</Text>
              </Pressable>
            ) : null}

            <Pressable onPress={goToUpdate} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Actualizar ahora</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  body: {
    marginTop: 10,
    color: theme.colors.textSecondary,
    fontSize: theme.font.sm,
  },
  notes: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  helpCard: {
    marginTop: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    padding: 10,
    gap: 8,
  },
  helpDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.xs,
    lineHeight: 18,
  },
  helpActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  helpActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.colors.accent}22`,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  helpActionText: {
    color: theme.colors.accent,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.xs,
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  secondaryBtn: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xs,
  },
  primaryBtn: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: theme.weight.bold,
    fontSize: theme.font.xs,
  },
});
