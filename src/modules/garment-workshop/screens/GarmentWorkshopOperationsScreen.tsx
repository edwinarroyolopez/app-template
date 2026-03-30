import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { MainLayout } from '@/components/MainLayout/MainLayout';
import { OperationalModal } from '@/components/ui/OperationalModal';
import { theme } from '@/theme';
import {
  useCreateGarmentOperation,
  useDeleteGarmentOperation,
  useGarmentMachines,
  useGarmentOperations,
  useUpdateGarmentOperation,
} from '../hooks/useGarmentWorkshop';
import { GarmentMachineSelectorModal } from '../components/GarmentMachineSelectorModal';
import { CreateGarmentMachineModal } from '../components/CreateGarmentMachineModal';

function money(value: number) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

export default function GarmentWorkshopOperationsScreen() {
  const operationsQuery = useGarmentOperations();
  const deleteOperation = useDeleteGarmentOperation();
  const [showModal, setShowModal] = useState(false);
  const [editOperation, setEditOperation] = useState<any | null>(null);

  const operations = (operationsQuery.data || []) as any[];

  function removeOperation(item: any) {
    Alert.alert(
      'Eliminar operación',
      `¿Seguro que quieres eliminar "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOperation.mutateAsync(item._id);
              Toast.show({ type: 'success', text1: 'Operación eliminada' });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'No se pudo eliminar',
                text2: error?.response?.data?.message || undefined,
              });
            }
          },
        },
      ],
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Catálogo de operaciones</Text>
            <Text style={styles.subtitle}>Define operación, máquina y precio unitario.</Text>
          </View>

          <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Plus size={16} color="#041427" />
          </Pressable>
        </View>

        <FlatList
          data={operations}
          keyExtractor={(item) => item._id}
          refreshing={operationsQuery.isFetching}
          onRefresh={operationsQuery.refetch}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Wrench size={20} color="#8EA4CC" />
              <Text style={styles.emptyTitle}>No hay operaciones</Text>
              <Text style={styles.emptySubtitle}>Crea operaciones para poder definir prendas y lotes.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowLine}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.cardActions}>
                  <Text style={styles.priceTag}>{money(item.unitPriceCop)}</Text>
                  <Pressable style={styles.iconBtn} onPress={() => setEditOperation(item)}>
                    <Pencil size={13} color="#A5B8DC" />
                  </Pressable>
                  <Pressable style={styles.iconBtn} onPress={() => removeOperation(item)}>
                    <Trash2 size={13} color="#FCA5A5" />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.meta}>Máquina: {item.machineName || 'No definida'}</Text>
              <Text style={styles.meta}>Secuencia: {item.sequence || 1}</Text>
            </View>
          )}
        />

        <CreateOperationModal visible={showModal} onClose={() => setShowModal(false)} />
        <EditOperationModal
          operation={editOperation}
          visible={!!editOperation}
          onClose={() => setEditOperation(null)}
        />
      </View>
    </MainLayout>
  );
}

function CreateOperationModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const createOperation = useCreateGarmentOperation();
  const [name, setName] = useState('');
  const [machineId, setMachineId] = useState('');
  const [machineLabel, setMachineLabel] = useState('');
  const [unitPriceCop, setUnitPriceCop] = useState('');
  const [sequence, setSequence] = useState('1');
  const [machineSearch, setMachineSearch] = useState('');
  const [machineSeed, setMachineSeed] = useState('');
  const [showMachineSelector, setShowMachineSelector] = useState(false);
  const [showCreateMachine, setShowCreateMachine] = useState(false);
  const machinesQuery = useGarmentMachines();
  const operationMachines = (machinesQuery.data || []) as any[];

  async function save() {
    if (!name.trim() || !unitPriceCop.trim()) {
      Toast.show({ type: 'error', text1: 'Nombre y precio son requeridos' });
      return;
    }

    try {
      await createOperation.mutateAsync({
        name: name.trim(),
        machineId: machineId || undefined,
        unitPriceCop: Number(unitPriceCop),
        sequence: Number(sequence || 1),
      });
      Toast.show({ type: 'success', text1: 'Operación creada' });
      setName('');
      setMachineId('');
      setMachineLabel('');
      setMachineSearch('');
      setUnitPriceCop('');
      setSequence('1');
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  return (
    <>
      <OperationalModal
      visible={visible}
      onClose={onClose}
      title="Nueva operación"
      presentation="center"
      animationType="fade"
      contentContainerStyle={styles.modalContent}
      footer={
        <Pressable style={styles.saveBtn} onPress={save} disabled={createOperation.isPending}>
          <Text style={styles.saveText}>{createOperation.isPending ? 'Guardando...' : 'Guardar'}</Text>
        </Pressable>
      }
    >
      <TextInput
        placeholder="Nombre"
        placeholderTextColor="#8EA4CC"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Text style={styles.modalLabel}>Máquina</Text>
      <Pressable style={styles.selectorBtn} onPress={() => setShowMachineSelector(true)}>
        <Text style={styles.selectorText}>{machineLabel || 'Seleccionar o crear máquina'}</Text>
      </Pressable>
      <TextInput
        placeholder="Precio por unidad"
        placeholderTextColor="#8EA4CC"
        value={unitPriceCop}
        onChangeText={setUnitPriceCop}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Secuencia"
        placeholderTextColor="#8EA4CC"
        value={sequence}
        onChangeText={setSequence}
        keyboardType="numeric"
        style={styles.input}
      />
      </OperationalModal>

      <GarmentMachineSelectorModal
        visible={showMachineSelector}
        searchValue={machineSearch}
        machines={operationMachines as any[]}
        onSearchChange={setMachineSearch}
        onClose={() => setShowMachineSelector(false)}
        onSelect={(machine) => {
          setMachineId(machine?._id || '');
          setMachineLabel(machine?.name || 'Sin máquina');
          setShowMachineSelector(false);
        }}
        onCreateRequest={(nameSeed) => {
          setMachineSeed(nameSeed);
          setShowCreateMachine(true);
        }}
      />

      <CreateGarmentMachineModal
        visible={showCreateMachine}
        initialValue={machineSeed}
        onClose={() => setShowCreateMachine(false)}
        onCreated={(machine) => {
          setMachineId(machine._id);
          setMachineLabel(machine.name);
          setShowMachineSelector(false);
        }}
      />
    </>
  );
}

function EditOperationModal({
  operation,
  visible,
  onClose,
}: {
  operation: any | null;
  visible: boolean;
  onClose: () => void;
}) {
  const updateOperation = useUpdateGarmentOperation();

  const [name, setName] = useState('');
  const [unitPriceCop, setUnitPriceCop] = useState('');
  const [sequence, setSequence] = useState('1');
  const [machineId, setMachineId] = useState('');
  const [machineLabel, setMachineLabel] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [machineSeed, setMachineSeed] = useState('');
  const [showMachineSelector, setShowMachineSelector] = useState(false);
  const [showCreateMachine, setShowCreateMachine] = useState(false);
  const machinesQuery = useGarmentMachines();

  React.useEffect(() => {
    if (!operation) return;
    setName(operation.name || '');
    setUnitPriceCop(String(operation.unitPriceCop || ''));
    setSequence(String(operation.sequence || 1));
    setMachineId(operation.machineId || '');
    setMachineLabel(operation.machineName || '');
  }, [operation]);

  async function save() {
    if (!operation || !name.trim() || !unitPriceCop.trim()) {
      Toast.show({ type: 'error', text1: 'Nombre y precio son requeridos' });
      return;
    }

    try {
      await updateOperation.mutateAsync({
        operationId: operation._id,
        name: name.trim(),
        machineId: machineId || undefined,
        unitPriceCop: Number(unitPriceCop),
        sequence: Number(sequence || 1),
      });
      Toast.show({ type: 'success', text1: 'Operación actualizada' });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar',
        text2: error?.response?.data?.message || undefined,
      });
    }
  }

  const operationMachines = (machinesQuery.data || []) as any[];

  return (
    <>
      <OperationalModal
      visible={visible}
      onClose={onClose}
      title="Editar operación"
      presentation="center"
      animationType="fade"
      contentContainerStyle={styles.modalContent}
      footer={
        <Pressable style={styles.saveBtn} onPress={save} disabled={updateOperation.isPending}>
          <Text style={styles.saveText}>{updateOperation.isPending ? 'Guardando...' : 'Guardar cambios'}</Text>
        </Pressable>
      }
    >
      <TextInput
        placeholder="Nombre"
        placeholderTextColor="#8EA4CC"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.modalLabel}>Máquina</Text>
      <Pressable style={styles.selectorBtn} onPress={() => setShowMachineSelector(true)}>
        <Text style={styles.selectorText}>{machineLabel || 'Seleccionar o crear máquina'}</Text>
      </Pressable>

      <TextInput
        placeholder="Precio por unidad"
        placeholderTextColor="#8EA4CC"
        value={unitPriceCop}
        onChangeText={setUnitPriceCop}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Secuencia"
        placeholderTextColor="#8EA4CC"
        value={sequence}
        onChangeText={setSequence}
        keyboardType="numeric"
        style={styles.input}
      />
      </OperationalModal>

      <GarmentMachineSelectorModal
        visible={showMachineSelector}
        searchValue={machineSearch}
        machines={operationMachines as any[]}
        onSearchChange={setMachineSearch}
        onClose={() => setShowMachineSelector(false)}
        onSelect={(machine) => {
          setMachineId(machine?._id || '');
          setMachineLabel(machine?.name || 'Sin máquina');
          setShowMachineSelector(false);
        }}
        onCreateRequest={(nameSeed) => {
          setMachineSeed(nameSeed);
          setShowCreateMachine(true);
        }}
      />

      <CreateGarmentMachineModal
        visible={showCreateMachine}
        initialValue={machineSeed}
        onClose={() => setShowCreateMachine(false)}
        onCreated={(machine) => {
          setMachineId(machine._id);
          setMachineLabel(machine.name);
          setShowMachineSelector(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    color: '#EAF1FF',
    fontSize: theme.font.xl,
    fontWeight: theme.weight.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#8EA4CC',
    fontSize: 12,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 12,
    marginBottom: 8,
    gap: 3,
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
    flex: 1,
  },
  priceTag: {
    color: '#86EFAC',
    fontWeight: theme.weight.semibold,
    fontSize: 12,
  },
  meta: {
    color: '#8EA4CC',
    fontSize: 11,
  },
  emptyCard: {
    marginTop: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#EAF1FF',
    fontWeight: theme.weight.bold,
  },
  emptySubtitle: {
    color: '#8EA4CC',
    fontSize: 12,
    textAlign: 'center',
  },
  modalContent: {
    gap: 8,
  },
  input: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F3765',
    backgroundColor: '#0A1835',
    color: '#EAF1FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalLabel: {
    color: '#8EA4CC',
    fontSize: 11,
    marginTop: 2,
  },
  selectorBtn: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#315A92',
    backgroundColor: '#10284D',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  selectorText: {
    color: '#DCE8FF',
    fontSize: 12,
    fontWeight: theme.weight.semibold,
  },
  saveBtn: {
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#041427',
    fontWeight: theme.weight.bold,
  },
});
