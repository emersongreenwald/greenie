import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOrgPendingLogs, verifyHourLog, rejectHourLog } from '../../services/hours';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, fonts, shadows } from '../../constants/theme';
import type { HourLog } from '../../types/hours';

export default function OrgVerifications() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [logs, setLogs] = useState<HourLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const data = await getOrgPendingLogs(profile.id);
      setLogs(data);
      setLoading(false);
    }
    load().catch(console.error);
  }, []);

  async function handleVerify(logId: string) {
    setActionLoading(logId);
    try {
      await verifyHourLog(logId);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(logId: string) {
    setActionLoading(logId);
    try {
      await rejectHourLog(logId);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream">
      <View className="pt-16 px-6 pb-6">
        <TouchableOpacity
          className="flex-row items-center gap-1 mb-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.default} />
          <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm">back</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal">
          pending verifications
        </Text>
      </View>

      {logs.length === 0 ? (
        <View className="items-center justify-center px-8 pt-16">
          <Ionicons name="checkmark-circle-outline" size={40} color={colors.text.muted} />
          <Text style={{ fontFamily: fonts.bold }} className="text-[20px] text-charcoal mt-4 mb-2">
            all good here
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
            nothing to review right now.
          </Text>
        </View>
      ) : (
        <View className="px-6 pb-12 gap-4">
          {logs.map((log) => {
            const isActing = actionLoading === log.id;
            const dateStr = new Date(log.actual_date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View key={log.id} className="bg-white rounded-2xl p-5" style={shadows.card}>
                <Text style={{ fontFamily: fonts.semibold }} className="text-[15px] text-charcoal">
                  {log.profiles?.full_name ?? 'Student'}
                </Text>
                {log.profiles?.school_name ? (
                  <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5 mb-3">
                    {log.profiles.school_name}
                  </Text>
                ) : (
                  <View className="mb-3" />
                )}

                <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm mb-1">
                  {log.opportunities?.title}
                </Text>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={13} color={colors.gold.default} />
                    <Text style={{ fontFamily: fonts.semibold }} className="text-gold text-sm">
                      {Number(log.hours_logged).toFixed(1)}h
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="calendar-outline" size={13} color={colors.text.muted} />
                    <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">
                      {dateStr}
                    </Text>
                  </View>
                </View>

                {log.service_description ? (
                  <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] text-sm mt-3 italic">
                    "{log.service_description}"
                  </Text>
                ) : null}

                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    className="flex-1 bg-brand rounded-xl py-3 items-center flex-row justify-center gap-1.5"
                    onPress={() => handleVerify(log.id)}
                    disabled={isActing}
                    style={{ opacity: isActing ? 0.5 : 1 }}
                  >
                    <Ionicons name="checkmark" size={14} color="white" />
                    <Text style={{ fontFamily: fonts.semibold }} className="text-white text-[13px]">verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blush-light border border-blush rounded-xl py-3 items-center flex-row justify-center gap-1.5"
                    onPress={() => handleReject(log.id)}
                    disabled={isActing}
                    style={{ opacity: isActing ? 0.5 : 1 }}
                  >
                    <Ionicons name="close" size={14} color={colors.error} />
                    <Text style={{ fontFamily: fonts.semibold }} className="text-[#dc4f4f] text-[13px]">reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
