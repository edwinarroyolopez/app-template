import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProtectedOverviewScreen from '@/modules/starter-protected/screens/ProtectedOverviewScreen';
import ProtectedFormsScreen from '@/modules/starter-protected/screens/ProtectedFormsScreen';
import ProtectedStatesScreen from '@/modules/starter-protected/screens/ProtectedStatesScreen';

export type AppStackParamList = {
  ProtectedOverview: undefined;
  ProtectedForms: undefined;
  ProtectedStates: undefined;
  [key: string]: object | undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="ProtectedOverview" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProtectedOverview" component={ProtectedOverviewScreen} />
      <Stack.Screen name="ProtectedForms" component={ProtectedFormsScreen} />
      <Stack.Screen name="ProtectedStates" component={ProtectedStatesScreen} />
    </Stack.Navigator>
  );
}
