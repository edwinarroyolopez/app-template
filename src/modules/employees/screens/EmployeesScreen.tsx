import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { theme } from '@/theme';
import { useEmployees } from '../hooks/useEmployees';
import { useDeactivateEmployee } from '../hooks/useDeactivateEmployee';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';

const ROLE_LABELS: Record<string, string> = {
  WORKSPACE_MANAGER: 'Encargado',
  SELLER: 'Vendedor',
  MANUFACTURER: 'Fabricante',
  TRANSPORTER: 'Transportador',
  GENERAL_SUPPORT: 'Apoyo',
};

export default function EmployeesScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const searchQuery = search.trim().length >= 2 ? search.trim() : undefined;
  const { data: employees = [], isFetching, refetch } = useEmployees(searchQuery);
  const deactivateEmployee = useDeactivateEmployee();

  const helperText = useMemo(() => {
    if (search.trim().length === 0) return 'Gestiona responsables para pedidos atrasados y en fabrica.';
    if (search.trim().length < 2) return 'Escribe al menos 2 caracteres para buscar.';
    return `Resultados para "${search.trim()}"`;
  }, [search]);

  async function handleDeactivate(employeeId: string) {
    if (deactivateEmployee.isPending) return;

    try {
      await deactivateEmployee.mutateAsync(employeeId);
      Toast.show({ type: 'success', text1: 'Empleado desactivado' });
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo desactivar' });
    }
  }

  function handleEdit(employee: any) {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Empleados</Text>
        <Text style={styles.subtitle}>Define responsables operativos para seguimiento de ventas</Text>

        <View style={styles.searchWrap}>
          <Search size={16} color="#8EA4CC" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar empleado"
            placeholderTextColor="#6F87B3"
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.helperText}>{helperText}</Text>

        <Pressable style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <Plus size={16} color="#F0F6FF" />
          <Text style={styles.createBtnText}>Crear empleado</Text>
        </Pressable>

        <FlatList
          data={employees as any[]}
          keyExtractor={(item) => item._id}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No hay empleados</Text>
              <Text style={styles.emptySubtitle}>Agrega empleados para asignar responsables.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemMain}>
                <UserRound size={16} color="#8EA4CC" />
                <View style={styles.itemTextWrap}>
                  <Text style={styles.itemName}>{item.name} {item.lastName}</Text>
                  <Text style={styles.itemPhone}>{item.phone} • {ROLE_LABELS[item.role] || 'Apoyo'}</Text>
                </View>
              </View>

              {!!item.isSystemUser && (
                <View style={styles.userBadge}>
                  <Text style={styles.userBadgeText}>Usuario app</Text>
                </View>
              )}

              <View style={styles.actionsWrap}>
                <Pressable style={styles.editBtn} onPress={() => handleEdit(item)}>
                  <Pencil size={14} color="#60A5FA" />
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDeactivate(item._id)}>
                  <Trash2 size={14} color="#F87171" />
                </Pressable>
              </View>
            </View>
          )}
        />

        <CreateEmployeeModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
        <EditEmployeeModal
          visible={showEditModal}
          employee={selectedEmployee}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    marginBottom: 10,
    color: theme.colors.textMuted,
  },
  searchWrap: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#DCE8FF',
  },
  helperText: {
    marginTop: 6,
    marginBottom: 10,
    color: '#8EA4CC',
    fontSize: theme.font.xs,
  },
  createBtn: {
    marginBottom: 10,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  createBtnText: {
    color: '#F0F6FF',
    fontWeight: theme.weight.bold,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.md,
  },
  itemPhone: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A222A',
    backgroundColor: '#2A1218',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsWrap: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2E6BFF66',
    backgroundColor: '#0D224A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  userBadgeText: {
    color: '#9FC0FF',
    fontSize: 10,
    fontWeight: theme.weight.semibold,
  },
  emptyCard: {
    marginTop: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.weight.bold,
    fontSize: theme.font.md,
  },
  emptySubtitle: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: theme.font.sm,
  },
});
