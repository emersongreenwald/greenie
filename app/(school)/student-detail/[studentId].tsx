import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProfile } from '../../../services/auth';
import { getStudentServiceRecord } from '../../../services/hours';
import { colors, fonts, shadows } from '../../../constants/theme';
import type { Profile } from '../../../types/auth';
import type { ServiceRecord } from '../../../types/hours';

export default function StudentDetail() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();

  const [student, setStudent] = useState<Profile | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profile, serviceRecords] = await Promise.all([
        getProfile(studentId),
        getStudentServiceRecord(studentId),
      ]);
      setStudent(profile);
      setRecords(serviceRecords);
      setLoading(false);
    }
    load().catch(console.error);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  if (!student) return null;

  const totalHours = records.reduce((sum, r) => sum + Number(r.hours_logged), 0);
  const uniqueOrgs = new Set(
    records.map((r) => r.opportunities?.profiles?.full_name).filter(Boolean)
  ).size;

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="pt-16 px-6 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-5"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text.muted} />
          <Text style={{ fontFamily: fonts.regular }} className="text-sm text-[#7e9488]">
            back
          </Text>
        </TouchableOpacity>

        <Text style={{ fontFamily: fonts.bold }} className="text-[24px] text-charcoal leading-tight">
          {student.full_name}
        </Text>
        {student.school_name ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-sm text-[#7e9488] mt-0.5">
            {student.school_name}
            {student.graduation_year ? ` · Class of ${student.graduation_year}` : ''}
          </Text>
        ) : null}
      </View>

      {/* Stats row */}
      <View className="flex-row mx-6 mb-6 bg-white rounded-2xl overflow-hidden" style={shadows.card}>
        <View className="flex-1 px-4 py-4 items-center border-r border-[#e0d9d0]">
          <Text style={{ fontFamily: fonts.bold }} className="text-2xl text-charcoal">
            {totalHours.toFixed(1)}
          </Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: 0.3 }} className="text-[10px] text-[#7e9488] mt-0.5 uppercase">
            verified hrs
          </Text>
        </View>
        <View className="flex-1 px-4 py-4 items-center border-r border-[#e0d9d0]">
          <Text style={{ fontFamily: fonts.bold }} className="text-2xl text-charcoal">
            {student.level ?? 1}
          </Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: 0.3 }} className="text-[10px] text-[#7e9488] mt-0.5 uppercase">
            level
          </Text>
        </View>
        <View className="flex-1 px-4 py-4 items-center">
          <Text style={{ fontFamily: fonts.bold }} className="text-2xl text-charcoal">
            {student.streak ?? 0}
          </Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: 0.3 }} className="text-[10px] text-[#7e9488] mt-0.5 uppercase">
            wk streak
          </Text>
        </View>
      </View>

      {/* Service log */}
      <View className="px-6">
        <View className="flex-row items-baseline justify-between mb-4">
          <Text style={{ fontFamily: fonts.semibold, letterSpacing: 1.2 }} className="text-xs text-charcoal uppercase">
            service log
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-[11px] text-[#7e9488]">
            {records.length} {records.length === 1 ? 'entry' : 'entries'} · {uniqueOrgs} {uniqueOrgs === 1 ? 'org' : 'orgs'}
          </Text>
        </View>

        {records.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center" style={shadows.card}>
            <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
              no verified service yet.
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-2xl px-5 pt-5" style={shadows.card}>
            {records.map((record, index) => {
              const date = new Date(record.actual_date + 'T12:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });
              return (
                <View
                  key={record.id}
                  className={`pb-5 mb-5${index < records.length - 1 ? ' border-b border-[#e0d9d0]' : ''}`}
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
                    <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] text-sm mt-2.5 leading-6 italic">
                      "{record.service_description}"
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
