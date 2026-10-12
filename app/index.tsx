import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../constants/theme';
import { IS_DEMO } from '../lib/demo';

export default function Index() {
  const { session, profile, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  if (IS_DEMO && !profile) return <Redirect href="/demo" />;
  if (!IS_DEMO && !session) return <Redirect href="/(auth)/welcome" />;
  if (profile?.account_type === 'student') return <Redirect href="/(student)/discover" />;
  if (profile?.account_type === 'school') return <Redirect href="/(school)/dashboard" />;
  return <Redirect href="/(org)/dashboard" />;
}
