// src/modules/memberships/components/MembershipCard.tsx
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import {
  Edit,
  User,
  Phone,
  Layers,
  BadgeCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { theme } from '@/theme';

type Props = {
  membership: any;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onToggleActive?: (nextActive: boolean) => void;
  onEdit?: () => void;
};

export default function MembershipCard({
  membership,
  onActivate,
  onDeactivate,
  onToggleActive,
  onEdit,
}: Props) {
  const user = membership.user;
  const isActive = membership.isActive;

  const borderColor = isActive
    ? theme.colors.success
    : theme.colors.textMuted;

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: borderColor },
        !isActive && styles.inactiveContainer,
      ]}
    >
      {/* BADGE INACTIVO */}
      {!isActive && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveBadgeText}>
            INACTIVO
          </Text>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.userIconWrap}>
            <User size={20} color={theme.colors.textPrimary} />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || 'Operador'}
            </Text>
            <View style={styles.metaRow}>
              <Layers size={12} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>
                {membership.puestoCount} puestos asignados
              </Text>
            </View>
            <View style={styles.planRow}>
              <BadgeCheck size={12} color={theme.colors.accent} />
              <Text style={styles.planText}>Membresia operativa</Text>
            </View>
          </View>
        </View>

        {onEdit && (
          <Pressable onPress={onEdit} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Edit size={16} color={theme.colors.textPrimary} />
          </Pressable>
        )}
      </View>

      {/* CONTACTO */}
      {user?.phone && (
        <View style={styles.contactRow}>
          <Phone size={12} color={theme.colors.textSecondary} />
          <Text style={styles.contactText}>
            {user.phone}
          </Text>
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* ESTADO */}
        <View style={styles.statusRow}>
          {isActive ? (
            <CheckCircle size={13} color={theme.colors.success} />
          ) : (
            <AlertCircle size={13} color={theme.colors.textMuted} />
          )}
          <Text style={[styles.statusText, { color: borderColor }]}>
            {isActive ? 'Activo / operando' : 'No activo'}
          </Text>
        </View>

        <View style={styles.switchWrap}>
          <Text style={styles.switchLabel}>{isActive ? 'Activo' : 'Inactivo'}</Text>
          <Switch
            value={isActive}
            onValueChange={(next) => {
              if (onToggleActive) {
                onToggleActive(next);
                return;
              }

              if (next && onActivate) onActivate();
              if (!next && onDeactivate) onDeactivate();
            }}
            trackColor={{ false: theme.colors.surfaceSoft, true: `${theme.colors.success}66` }}
            thumbColor={isActive ? theme.colors.success : theme.colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
  },
  inactiveContainer: {
    opacity: 0.72,
  },
  inactiveBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inactiveBadgeText: {
    fontSize: theme.font.xs,
    fontWeight: theme.weight.bold,
    color: theme.colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  userIconWrap: {
    backgroundColor: theme.colors.surfaceSoft,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: theme.font.md,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.font.xs,
    color: theme.colors.textMuted,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  planText: {
    fontSize: theme.font.xs,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    width: theme.spacing.lg * 2,
    height: theme.spacing.lg * 2,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.font.sm,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderStyle: 'dashed',
    gap: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.font.sm,
    fontWeight: theme.weight.bold,
  },
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  switchLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.xs,
    fontWeight: theme.weight.semibold,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.5,
  },
});
