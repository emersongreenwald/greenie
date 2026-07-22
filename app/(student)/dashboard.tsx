import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';

export default function StudentDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setProfile(null);
    router.replace('/(auth)/sign-in');
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-green-600 mb-2">
        Welcome, {profile?.full_name}
      </Text>
      <Text className="text-gray-500 mb-12">Student dashboard — coming soon</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text className="text-red-500">Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
