import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStudentServiceRecord } from '../../services/hours';
import { exportServiceRecordPDF } from '../../services/pdf';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, fonts } from '../../constants/theme';
import type { ServiceRecord } from '../../types/hours';

export default function StudentServiceRecord() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const data = await getStudentServiceRecord(profile.id);
      setRecords(data);
      setLoading(false);
    }
    load().catch(console.error);
  }, []);

  async function handleExport() {
    if (!profile) return;
    setExporting(true);
    try {
      await exportServiceRecordPDF(profile, records);
    } catch (e) {
      Alert.alert('export failed', 'something went wrong generating your PDF.');
    } finally {
      setExporting(false);
    }
  }

  const totalHours = records.reduce((sum, r) => sum + Number(r.hours_logged), 0);
  const uniqueOrgs = new Set(
    records.map((r) => r.opportunities?.profiles?.full_name).filter(Boolean)
  ).size;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Document header */}
      <View className="px-8 pt-14 pb-8 border-b border-[#e0d9d0]">
        <View className="flex-row items-center justify-between mb-8">
          <Text style={{ fontFamily: fonts.extrabold }} className="text-[13px] text-brand">
            greenie
          </Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={handleExport}
              disabled={exporting}
              style={{ opacity: exporting ? 0.4 : 1 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-outline" size={18} color={colors.brand.default} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ fontFamily: fonts.bold }} className="text-[26px] text-charcoal leading-tight">
          {profile?.full_name}
        </Text>
        {profile?.school_name ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm mt-1">
            {profile.school_name}
            {profile.graduation_year ? ` · Class of ${profile.graduation_year}` : ''}
          </Text>
        ) : null}
      </View>

      {/* Impact summary */}
      <View className="flex-row border-b border-[#e0d9d0]">
        <View className="flex-1 px-8 py-6 border-r border-[#e0d9d0]">
          <Text style={{ fontFamily: fonts.bold }} className="text-3xl text-charcoal">
            {totalHours.toFixed(1)}
          </Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: 0.3 }} className="text-[11px] text-[#7e9488] mt-1 uppercase">
            verified hours
          </Text>
        </View>
        <View className="flex-1 px-6 py-6 border-r border-[#e0d9d0]">
          <Text style={{ fontFamily: fonts.bold }} className="text-3xl text-charcoal">
            {uniqueOrgs}
          </Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: 0.3 }} className="text-[11px] text-[#7e9488] mt-1 uppercase">
            organizations
          </Text>
        </View>
        <View className="flex-1 px-6 py-6">
          <Text style={{ fontFamily: fonts.bold }} className="text-3xl text-charcoal">
            {records.length}
          </Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: 0.3 }} className="text-[11px] text-[#7e9488] mt-1 uppercase">
            completed
          </Text>
        </View>
      </View>

      {/* Service log */}
      <View className="px-8 pt-8">
        <View className="flex-row items-baseline justify-between mb-6">
          <Text style={{ fontFamily: fonts.semibold, letterSpacing: 1.2 }} className="text-xs text-charcoal uppercase">
            service log
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-[11px] text-[#7e9488]">
            {records.length} {records.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>

        {records.length === 0 ? (
          <View className="py-8 items-center">
            <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
              no verified service yet.{'\n'}completed opportunities will appear here once your hours are verified.
            </Text>
          </View>
        ) : (
          records.map((record, index) => {
            const date = new Date(record.actual_date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View
                key={record.id}
                className={`pb-6 mb-6${index < records.length - 1 ? ' border-b border-[#e0d9d0]' : ''}`}
              >
                <Text style={{ fontFamily: fonts.semibold }} className="text-[15px] text-charcoal">
                  {record.opportunities?.title ?? 'Volunteer Service'}
                </Text>
                <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm mt-0.5">
                  {record.opportunities?.profiles?.full_name ?? 'Organization'}
                </Text>
                <View className="flex-row items-center gap-3 mt-2">
                  <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">
                    {date}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular }} className="text-[#e0d9d0]">·</Text>
                  <Text style={{ fontFamily: fonts.semibold }} className="text-charcoal text-sm">
                    {Number(record.hours_logged).toFixed(1)} {Number(record.hours_logged) === 1 ? 'hour' : 'hours'} verified
                  </Text>
                </View>
                {record.service_description ? (
                  <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] text-sm mt-3 leading-6 italic">
                    "{record.service_description}"
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </View>

      {/* Footer */}
      <View className="px-8 pt-4 mt-4 border-t border-[#e0d9d0] items-center">
        <Text style={{ fontFamily: fonts.regular }} className="text-[11px] text-[#7e9488]">
          verified by greenie · greenie.app
        </Text>
      </View>
    </ScrollView>
  );
}
