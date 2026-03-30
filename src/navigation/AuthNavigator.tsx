import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPhoneScreen from '@/modules/auth/screens/LoginPhoneScreen';
import LoginOtpScreen from '@/modules/auth/screens/LoginOtpScreen';
import RegisterScreen from '@/modules/auth/screens/RegisterScreen';

export type AuthStackParamList = {
    LoginPhone: undefined;
    LoginOtp: { phone: string; otpToken: string };
    Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginPhone" component={LoginPhoneScreen} />
            <Stack.Screen name="LoginOtp" component={LoginOtpScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
