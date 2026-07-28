import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut, getProfile } from '../../services/auth';
import { getSignedUpOpportunities } from '../../services/opportunities';
import { getStudentHourLogs } from '../../services/hours';
import { useAuthStore } from '../../stores/useAuthStore';
import { XPBar } from '../../components/ui/XPBar';
import { Button } from '../../components/ui/Button';
import { colors, fonts, shadows } from '../../constants/theme';
import type { Opportunity } from '../../types/opportunity';
import type { HourLog } from '../../types/hours';

export default function StudentDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [logMap, setLogMap] = useState<Record<string, HourLog>>({});
  const [loading, setLoading] = useState(true);
  const [xpGain, setXpGain] = useState(0);

  const xpFloatY       = useRef(new Animated.Value(0)).current;
  const xpFloatOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const oldXp = profile.xp ?? 0;

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

      const gain = (freshProfile.xp ?? 0) - oldXp;
      if (gain > 0) {
        setXpGain(gain);
        xpFloatY.setValue(0);
        xpFloatOpacity.setValue(1);
        Animated.parallel([
          Animated.timing(xpFloatY, {
            toValue: -52,
            duration: 1300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(600),
            Animated.timing(xpFloatOpacity, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }
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
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  const xp        = profile.xp ?? 0;
  const level     = profile.level ?? 1;
  const firstName = profile.full_name.split(' ')[0].toLowerCase();

  const verifiedLogs        = Object.values(logMap).filter((l) => l.status === 'verified');
  const totalVerifiedHours  = verifiedLogs.reduce((sum, l) => sum + Number(l.hours_logged), 0);

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="pt-16 px-6 pb-6">
        <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal">
          hey, {firstName}!
        </Text>
        {profile.school_name ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
            {profile.school_name} · class of {profile.graduation_year}
          </Text>
        ) : null}
      </View>

      {/* Level + Streak */}
      <View className="flex-row px-6 gap-3 mb-3">
        <View className="flex-1 bg-white rounded-2xl p-4" style={shadows.card}>
          <Ionicons name="trophy-outline" size={18} color={colors.gold.default} />
          <Text style={{ fontFamily: fonts.extrabold }} className="text-3xl text-charcoal mt-2">
            {level}
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
            current level
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4" style={shadows.card}>
          <Ionicons name="flame-outline" size={18} color={colors.gold.default} />
          <Text style={{ fontFamily: fonts.extrabold }} className="text-3xl text-charcoal mt-2">
            0
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
            day streak
          </Text>
        </View>
      </View>

      {/* XP Progress */}
      <View className="mx-6 mb-3 bg-white rounded-2xl p-5" style={shadows.card}>
        <Text style={{ fontFamily: fonts.semibold }} className="text-[13px] text-charcoal mb-3">
          keep growing
        </Text>
        <View>
          <XPBar xp={xp} level={level} />
          {xpGain > 0 && (
            <Animated.Text
              style={{
                position:    'absolute',
                right:       0,
                top:         -2,
                fontFamily:  fonts.bold,
                fontSize:    14,
                color:       colors.gold.default,
                opacity:     xpFloatOpacity,
                transform:   [{ translateY: xpFloatY }],
              }}
            >
              +{xpGain} xp
            </Animated.Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row px-6 gap-3 mb-6">
        <View className="flex-1 bg-white rounded-2xl p-4" style={shadows.card}>
          <Text style={{ fontFamily: fonts.extrabold }} className="text-2xl text-charcoal">
            {totalVerifiedHours.toFixed(1)}
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
            verified hours
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4" style={shadows.card}>
          <Text style={{ fontFamily: fonts.extrabold }} className="text-2xl text-charcoal">
            {verifiedLogs.length}
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
            completed
          </Text>
        </View>
      </View>

      {/* Opportunities */}
      {opportunities.length > 0 ? (
        <>
          <Text style={{ fontFamily: fonts.semibold }} className="text-[13px] text-charcoal px-6 mb-3">
            your opportunities
          </Text>
          <View className="px-6 gap-3">
            {opportunities.map((opp) => {
              const log = logMap[opp.id];
              return (
                <View key={opp.id} className="bg-white rounded-2xl p-4" style={shadows.card}>
                  <Text style={{ fontFamily: fonts.semibold }} className="text-[15px] text-charcoal mb-0.5">
                    {opp.title}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular }} className="text-brand text-sm mb-3">
                    {opp.profiles?.full_name ?? 'Organization'}
                  </Text>

                  {!log ? (
                    <TouchableOpacity
                      className="bg-brand rounded-xl py-3 flex-row items-center justify-center gap-2"
                      onPress={() =>
                        router.push({
                          pathname: '/(student)/log-hours/[opportunityId]',
                          params: {
                            opportunityId: opp.id,
                            title:         opp.title,
                            hoursValue:    String(opp.hours_value),
                          },
                        })
                      }
                    >
                      <Ionicons name="pencil-outline" size={13} color="white" />
                      <Text style={{ fontFamily: fonts.semibold }} className="text-white text-[13px]">
                        log hours
                      </Text>
                    </TouchableOpacity>
                  ) : log.status === 'pending' ? (
                    <View className="bg-amber-50 border border-amber-200 rounded-xl py-3 flex-row items-center justify-center gap-2">
                      <Ionicons name="time-outline" size={13} color="#b45309" />
                      <Text style={{ fontFamily: fonts.semibold }} className="text-amber-700 text-[13px]">
                        waiting on your org
                      </Text>
                    </View>
                  ) : log.status === 'verified' ? (
                    <View className="bg-brand-muted border border-brand-border rounded-xl py-3 flex-row items-center justify-center gap-2">
                      <Ionicons name="checkmark-circle" size={13} color={colors.brand.dark} />
                      <Text style={{ fontFamily: fonts.semibold }} className="text-brand-dark text-[13px]">
                        verified · nice work! · {Number(log.hours_logged).toFixed(1)}h · +{Math.round(Number(log.hours_logged) * 10)} xp
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-blush-light border border-blush rounded-xl py-3 flex-row items-center justify-center gap-2">
                      <Ionicons name="close-circle-outline" size={13} color={colors.error} />
                      <Text style={{ fontFamily: fonts.semibold }} className="text-[#dc4f4f] text-[13px]">
                        reach out to your org
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View className="mx-6 bg-white rounded-2xl p-6 items-center" style={shadows.card}>
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
            nothing here yet.{'\n'}head to discover and find your first opportunity.
          </Text>
        </View>
      )}

      {/* Sign out */}
      <View className="px-6 mt-10">
        <Button label="sign out" variant="danger" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}
