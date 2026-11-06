import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: Colors.card },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}>
        <Stack.Screen name="index" options={{ title: 'Pokemon Battle' }} />
        <Stack.Screen name="moves" options={{ title: 'Choose your moves' }} />
        <Stack.Screen name="battle" options={{ title: 'The fight' }} />
        <Stack.Screen name="history" options={{ title: 'Battle history' }} />
      </Stack>
    </QueryClientProvider>
  );
}
