

find ~/Coder/businesses/pulsoCop/src/modules/warehouse -type f -exec cat {} + >> archivo_destino.txt

businessApp/
├── android/
├── ios/                # (no se usa, pero RN lo crea)
├── src/
│   ├── app.tsx
│   ├── main.tsx
│
│   ├── modules/        # 🔥 Dominio de negocio
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── LoginPhoneScreen.tsx
│   │   │   │   ├── LoginOtpScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── auth.api.ts
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   │
│   │   ├── businesses/
│   │   │   ├── screens/
│   │   │   │   ├── SelectBusinessScreen.tsx
│   │   │   │   ├── BusinessDashboardScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── businesses.api.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── operations/
│   │   │   ├── screens/
│   │   │   │   ├── LavadasListScreen.tsx
│   │   │   │   ├── CreateLavadaScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── operations.api.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── downtimes/
│   │   │   ├── screens/
│   │   │   │   ├── DowntimesScreen.tsx
│   │   │   │   ├── OpenDowntimeScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── downtimes.api.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── screens/
│   │   │   │   ├── AnalyticsOverviewScreen.tsx
│   │   │   │   ├── RankingsScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── analytics.api.ts
│   │   │   └── types.ts
│   │
│   ├── navigation/     # 🧭 Navegación
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   ├── BusinessNavigator.tsx
│   │
│   ├── stores/         # 🧠 Zustand
│   │   ├── auth.store.ts
│   │   ├── business.store.ts
│   │   ├── operations.store.ts
│   │   ├── downtime.store.ts
│   │
│   ├── services/       # 🌐 Infra común
│   │   ├── api.ts
│   │   ├── queryClient.ts
│   │
│   ├── components/     # 🧩 UI reutilizable
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Loader.tsx
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │
│   └── utils/
│       ├── storage.ts
│       ├── format.ts
│
├── package.json
└── tsconfig.json
