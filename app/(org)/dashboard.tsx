import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from '../../services/auth';
import { getOrgPendingLogs } from '../../services/hours';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/theme';

export default function OrgDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const logs = await getOrgPendingLogs(profile.id);
      setPendingCount(logs.length);
      setLoading(false);
    }
    load().catch(console.error);
  }, []);

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setProfile(null);
    router.replace('/(auth)/sign-in');
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">{profile?.full_name}</Text>
        <Text className="text-gray-500 text-sm">Organization dashboard</Text>
      </View>

      <View className="px-6 mt-6">
        <TouchableOpacity
          className="bg-white rounded-2xl p-6 shadow-sm"
          onPress={() => router.push('/(org)/verifications')}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 text-sm mb-1">Pending verifications</Text>
              {loading ? (
                <ActivityIndicator color={colors.brand.default} />
              ) : (
                <Text className="text-3xl font-bold text-gray-900">{pendingCount}</Text>
              )}
            </View>
            <Text className="text-brand font-medium">Review →</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-auto pb-12">
        <Button label="Sign out" variant="danger" onPress={handleSignOut} />
      </View>
    </View>
  );
}
