import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';

export default function OrgDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setProfile(null);
    router.replace('/(auth)/sign-in');
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Welcome, {profile?.full_name}
      </Text>
      <Text className="text-gray-500 mb-12">Organization dashboard — coming soon</Text>
      <Button label="Sign out" variant="danger" onPress={handleSignOut} />
    </View>
  );
}
