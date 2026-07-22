import '../global.css';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
