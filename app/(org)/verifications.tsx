import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getOrgPendingLogs, verifyHourLog, rejectHourLog } from '../../services/hours';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../constants/theme';
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-brand font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Pending verifications</Text>
      </View>

      {logs.length === 0 ? (
        <View className="items-center justify-center px-8 pt-24">
          <Text className="text-2xl font-bold text-gray-900 mb-3">All caught up</Text>
          <Text className="text-gray-500 text-center">
            No pending hour submissions right now.
          </Text>
        </View>
      ) : (
        <View className="px-6 pt-6 pb-12 gap-4">
          {logs.map((log) => {
            const isActing = actionLoading === log.id;
            const dateStr = new Date(log.actual_date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View key={log.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="font-semibold text-gray-900">
                  {log.profiles?.full_name ?? 'Student'}
                </Text>
                {log.profiles?.school_name ? (
                  <Text className="text-gray-400 text-xs mb-2">{log.profiles.school_name}</Text>
                ) : null}

                <Text className="text-brand font-medium text-sm mb-1">
                  {log.opportunities?.title}
                </Text>
                <Text className="text-gray-700 text-sm">
                  {Number(log.hours_logged).toFixed(1)} hours · {dateStr}
                </Text>
                {log.service_description ? (
                  <Text className="text-gray-500 text-sm mt-2 italic">
                    "{log.service_description}"
                  </Text>
                ) : null}

                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    className="flex-1 bg-brand rounded-xl py-3 items-center"
                    onPress={() => handleVerify(log.id)}
                    disabled={isActing}
                    style={{ opacity: isActing ? 0.6 : 1 }}
                  >
                    <Text className="text-white font-semibold text-sm">Verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-50 border border-red-200 rounded-xl py-3 items-center"
                    onPress={() => handleReject(log.id)}
                    disabled={isActing}
                    style={{ opacity: isActing ? 0.6 : 1 }}
                  >
                    <Text className="text-red-600 font-semibold text-sm">Reject</Text>
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
