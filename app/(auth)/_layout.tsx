import { Redirect, Stack } from 'expo-router';
import { IS_DEMO } from '../../lib/demo';

export default function AuthLayout() {
  // The demo has no real accounts, so sign-in, sign-up, and sign-out land on the demo picker
  if (IS_DEMO) return <Redirect href="/demo" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
