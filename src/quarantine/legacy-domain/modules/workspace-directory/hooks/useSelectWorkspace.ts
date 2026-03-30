import { useNavigation } from '@react-navigation/native';
import { useOperationalWorkspaceContextStore, type OperationalWorkspaceContext } from '@/quarantine/legacy-domain/stores/operationalWorkspaceContext.store';

export function useSelectWorkspace() {
    const navigation = useNavigation<any>();
    const setActiveWorkspaceContext = useOperationalWorkspaceContextStore((s) => s.setActiveWorkspaceContext);

    function selectWorkspaceContext(ctx: OperationalWorkspaceContext) {
        setActiveWorkspaceContext(ctx);

        navigation.reset({
            index: 0,
            routes: [{ name: 'BusinessDetail' }],
        });
    }

    return selectWorkspaceContext;
}
