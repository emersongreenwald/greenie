import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut, getProfile } from '../../services/auth';
import { getSignedUpOpportunities } from '../../services/opportunities';
import { getStudentHourLogs } from '../../services/hours';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/theme';
import type { Opportunity } from '../../types/opportunity';
import type { HourLog } from '../../types/hours';

export default function StudentDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [logMap, setLogMap] = useState<Record<string, HourLog>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const [freshProfile, opps, logs] = await Promise.all([
        getProfile(profile.id),
        getSignedUpOpportunities(profile.id),
        getStudentHourLogs(profile.id),
      ]);
      setProfile(freshProfile);
      setOpportunities(opps);
      const map: Record<string, HourLog> = {};
      for (const log of logs) map[log.opportunity_id] = log;
      setLogMap(map);
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

  if (loading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  const xp = profile.xp ?? 0;
  const level = profile.level ?? 1;
  const xpIntoLevel = xp % 100;
  const progressPercent = Math.round((xpIntoLevel / 100) * 100);

  const totalVerifiedHours = Object.values(logMap)
    .filter((l) => l.status === 'verified')
    .reduce((sum, l) => sum + Number(l.hours_logged), 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">{profile.full_name}</Text>
        {profile.school_name ? (
          <Text className="text-gray-500 text-sm mt-0.5">
            {profile.school_name} · Class of {profile.graduation_year}
          </Text>
        ) : null}
      </View>

      {/* XP / Level card */}
      <View className="mx-6 mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <Text className="text-brand text-4xl font-bold mb-1">Level {level}</Text>
        <Text className="text-gray-500 text-sm mb-3">
          {xpIntoLevel} / 100 XP to Level {level + 1}
        </Text>
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <View className="h-2 bg-brand rounded-full" style={{ width: `${progressPercent}%` }} />
        </View>
        <Text className="text-gray-400 text-xs mt-2">
          {xp} total XP · {totalVerifiedHours.toFixed(1)} verified hours
        </Text>
      </View>

      {/* Signed-up opportunities */}
      <View className="px-6 mt-6 mb-3">
        <Text className="text-lg font-semibold text-gray-900">My opportunities</Text>
      </View>

      {opportunities.length === 0 ? (
        <View className="mx-6 bg-white rounded-2xl p-6 items-center">
          <Text className="text-gray-400 text-center">
            No signed-up opportunities yet.{'\n'}Head to Discover to find something.
          </Text>
        </View>
      ) : (
        <View className="px-6 gap-3">
          {opportunities.map((opp) => {
            const log = logMap[opp.id];
            return (
              <View key={opp.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="font-semibold text-gray-900 mb-0.5">{opp.title}</Text>
                <Text className="text-brand text-sm mb-3">
                  {opp.profiles?.full_name ?? 'Organization'}
                </Text>

                {!log ? (
                  <TouchableOpacity
                    className="bg-brand rounded-xl py-3 items-center"
                    onPress={() =>
                      router.push({
                        pathname: '/(student)/log-hours/[opportunityId]',
                        params: {
                          opportunityId: opp.id,
                          title: opp.title,
                          hoursValue: String(opp.hours_value),
                        },
                      })
                    }
                  >
                    <Text className="text-white font-semibold text-sm">Log hours</Text>
                  </TouchableOpacity>
                ) : log.status === 'pending' ? (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-xl py-3 items-center">
                    <Text className="text-yellow-700 font-medium text-sm">
                      Pending verification
                    </Text>
                  </View>
                ) : log.status === 'verified' ? (
                  <View className="bg-brand-muted border border-brand-border rounded-xl py-3 items-center">
                    <Text className="text-brand-dark font-medium text-sm">
                      Verified · {Number(log.hours_logged).toFixed(1)}h · +
                      {Math.round(Number(log.hours_logged) * 10)} XP
                    </Text>
                  </View>
                ) : (
                  <View className="bg-red-50 border border-red-200 rounded-xl py-3 items-center">
                    <Text className="text-red-600 font-medium text-sm">
                      Rejected — contact the organization
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View className="px-6 mt-8 pb-12">
        <Button label="Sign out" variant="danger" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}
