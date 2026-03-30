import type { ComponentType } from 'react';
import { FormInput, LayoutDashboard, ShieldCheck } from 'lucide-react-native';

import type { AppStackParamList } from '@/navigation/AppNavigator';

type TabIcon = ComponentType<{ size?: number; color?: string }>;

export type BottomBarTab = {
  icon: TabIcon;
  route: keyof AppStackParamList;
  target: keyof AppStackParamList;
  hidden?: boolean;
};

export function buildBottomBarTabs(): BottomBarTab[] {
  return [
    { icon: LayoutDashboard, route: 'ProtectedOverview', target: 'ProtectedOverview' },
    { icon: FormInput, route: 'ProtectedForms', target: 'ProtectedForms' },
    { icon: ShieldCheck, route: 'ProtectedStates', target: 'ProtectedStates' },
  ];
}
