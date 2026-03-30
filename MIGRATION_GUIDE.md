# Mobile Migration Guide - Expo Router + React Query + bun

## ✅ Completed (Phase 3 Foundation)

- [x] Updated `package.json` — removed React Navigation, added expo-router, React Query
- [x] Created `src/lib/api.ts` — HTTP abstraction with token management
- [x] Created `src/context/AuthContext.tsx` — auth state management (AsyncStorage)
- [x] Created `src/providers/QueryProvider.tsx` — React Query setup
- [x] Created `src/hooks/useProfile.ts` — profile hooks with React Query

## ⏳ Next Steps

### 1. Install Dependencies
```bash
bun install
```

### 2. Create Expo Router App Structure

Move screens to file-based routing (currently in `src/screens/`, move to `app/`):

```
app/
├── _layout.tsx              # Root layout with Stack + AuthProvider
├── index.tsx                # Redirect to /login or /(tabs)/home
├── login.tsx                # Login screen (from LoginScreen.tsx)
├── signup.tsx               # Signup screen (from SignupScreen.tsx)
├── execution.tsx            # Execution screen
├── workout-editor.tsx       # Editor screen
└── (tabs)/
    ├── _layout.tsx          # Bottom Tabs layout
    ├── home.tsx             # Home screen
    ├── workouts.tsx         # Workouts list
    ├── kanban.tsx           # Kanban board
    ├── students.tsx         # Students (conditional by role)
    └── profile.tsx          # Profile screen
```

### 3. Create Root Layout (`app/_layout.tsx`)

```typescript
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryProvider>
  );
}

function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // Redirect based on auth state
    if (!token) {
      router.replace("/login");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [token, isLoading]);

  if (isLoading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

### 4. Create More Hooks

Similar to `useProfile.ts`, create:
- `src/hooks/useWorkouts.ts`
- `src/hooks/useTrainingSessions.ts`
- `src/hooks/useFeedback.ts`

### 5. Migrate Screens

For each screen in `src/screens/`:
1. Remove `useNavigation()`, `useRoute()` (use `useRouter()` instead)
2. Remove `route.params` (use `useLocalSearchParams()`)
3. Replace `fetch` with `api.*` methods
4. Add React Query hooks instead of `useEffect + useState`
5. Use `zodResolver` for form validation

**Example migration:**

```typescript
// Before (React Navigation)
export default function ProfileScreen({ navigation, route }) {
  const { token } = route.params;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setProfile);
  }, [token]);

  return <View>{/* ... */}</View>;
}

// After (Expo Router + React Query)
export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();

  return <View>{/* ... */}</View>;
}
```

### 6. Update app.json

Add expo-router configuration:

```json
{
  "expo": {
    "plugins": [
      ["expo-router/plugin"]
    ],
    "scheme": "lyft"
  }
}
```

### 7. Add AsyncStorage Dependency

```bash
bun add @react-native-async-storage/async-storage
```

## Testing

```bash
bun start

# Test in Android emulator
bun run android

# Test in iOS simulator
bun run ios
```

## Notes

- Token is stored in AsyncStorage (persisted across app restarts)
- All screens automatically redirect if not authenticated
- React Query handles caching and state management
- All HTTP calls go through `api.*` abstraction
- Zod validation can be added to forms with `react-hook-form`
