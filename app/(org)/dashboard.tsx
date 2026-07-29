import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../../services/auth';
import { getOrgPendingLogs } from '../../services/hours';
import { getOrgOpportunities } from '../../services/opportunities';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { colors, fonts, shadows } from '../../constants/theme';

export default function OrgDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [opportunityCount, setOpportunityCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const [logs, opps] = await Promise.all([
        getOrgPendingLogs(profile.id),
        getOrgOpportunities(profile.id),
      ]);
      setPendingCount(logs.length);
      setOpportunityCount(opps.length);
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
    <View className="flex-1 bg-cream">
      <View className="pt-16 pb-6 px-6">
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[28px] text-brand mb-0.5">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.bold }} className="text-[20px] text-charcoal">
          {profile?.full_name.toLowerCase()}
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
          organization dashboard
        </Text>
      </View>

      <View className="px-6 gap-3">
        <TouchableOpacity
          className="bg-white rounded-2xl p-5"
          style={shadows.card}
          onPress={() => router.push('/(org)/verifications')}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mb-1">
                pending verifications
              </Text>
              {loading ? (
                <ActivityIndicator color={colors.brand.default} />
              ) : (
                <Text style={{ fontFamily: fonts.extrabold }} className="text-4xl text-charcoal">
                  {pendingCount}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-1">
              <Text style={{ fontFamily: fonts.semibold }} className="text-brand text-sm">review</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.brand.default} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl p-5"
          style={shadows.card}
          onPress={() => router.push('/(org)/opportunities')}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mb-1">
                your opportunities
              </Text>
              {loading ? (
                <ActivityIndicator color={colors.brand.default} />
              ) : (
                <Text style={{ fontFamily: fonts.extrabold }} className="text-4xl text-charcoal">
                  {opportunityCount}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-1">
              <Text style={{ fontFamily: fonts.semibold }} className="text-brand text-sm">manage</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.brand.default} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-auto pb-12">
        <Button label="sign out" variant="danger" onPress={handleSignOut} />
      </View>
    </View>
  );
}
