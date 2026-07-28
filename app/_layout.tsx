import '../global.css';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  const [fontsLoaded] = useFonts({
    'Manrope-Regular':   Manrope_400Regular,
    'Manrope-Medium':    Manrope_500Medium,
    'Manrope-SemiBold':  Manrope_600SemiBold,
    'Manrope-Bold':      Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
  });

  useEffect(() => {
    initialize();
  }, []);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
