import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthNavigator from './AuthNavigator';
import StarterHomeScreen from '@/modules/starter-public/screens/StarterHomeScreen';
import StarterArchitectureScreen from '@/modules/starter-public/screens/StarterArchitectureScreen';
import SystemDesignScreen from '@/modules/system-design/screens/SystemDesignScreen';

export type PublicStackParamList = {
  StarterHome: undefined;
  SystemDesign: undefined;
  StarterArchitecture: undefined;
  AuthFlow: undefined;
};

const Stack = createNativeStackNavigator<PublicStackParamList>();

export default function PublicNavigator() {
  return (
    <Stack.Navigator initialRouteName="StarterHome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StarterHome" component={StarterHomeScreen} />
      <Stack.Screen name="SystemDesign" component={SystemDesignScreen} />
      <Stack.Screen name="StarterArchitecture" component={StarterArchitectureScreen} />
      <Stack.Screen name="AuthFlow" component={AuthNavigator} />
    </Stack.Navigator>
  );
}
