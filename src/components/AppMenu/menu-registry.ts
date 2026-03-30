import type { ComponentType } from 'react';
import { FormInput, LayoutDashboard, ShieldCheck } from 'lucide-react-native';

import type { AppStackParamList } from '@/navigation/AppNavigator';

export type MenuRoute = keyof AppStackParamList;
export type MenuIcon = ComponentType<{ size?: number; color?: string }>;

export type MenuEntry = {
  label: string;
  route: MenuRoute;
  icon: MenuIcon;
  danger?: boolean;
};

export type MenuSectionData = {
  key: string;
  title: string;
  items: MenuEntry[];
};

export function buildMenuSections(): MenuSectionData[] {
  return [
    {
      key: 'starter',
      title: 'Starter protected surfaces',
      items: [
        { icon: LayoutDashboard, label: 'Overview', route: 'ProtectedOverview' },
        { icon: FormInput, label: 'Forms', route: 'ProtectedForms' },
        { icon: ShieldCheck, label: 'States & gating', route: 'ProtectedStates' },
      ],
    },
  ];
}
