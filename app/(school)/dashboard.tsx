import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../../services/auth';
import { getSchoolStudents } from '../../services/school';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { colors, fonts, shadows } from '../../constants/theme';
import { useRouter } from 'expo-router';
import type { SchoolStudent } from '../../services/school';

export default function SchoolDashboard() {
  const router = useRouter();
  const { profile, setSession, setProfile } = useAuthStore();
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile?.school_name) return;
      const data = await getSchoolStudents(profile.school_name);
      setStudents(data);
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

  const totalHours = students.reduce((sum, s) => sum + s.verified_hours, 0);

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="pt-16 px-6 pb-6">
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[28px] text-brand mb-0.5">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.bold }} className="text-[20px] text-charcoal">
          {profile?.school_name?.toLowerCase()}
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
          school dashboard
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center pt-24">
          <ActivityIndicator color={colors.brand.default} />
        </View>
      ) : (
        <>
          <View className="flex-row px-6 gap-3 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4" style={shadows.card}>
              <Ionicons name="people-outline" size={18} color={colors.brand.default} />
              <Text style={{ fontFamily: fonts.extrabold }} className="text-3xl text-charcoal mt-2">
                {students.length}
              </Text>
              <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
                students
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4" style={shadows.card}>
              <Ionicons name="time-outline" size={18} color={colors.gold.default} />
              <Text style={{ fontFamily: fonts.extrabold }} className="text-3xl text-charcoal mt-2">
                {totalHours.toFixed(1)}
              </Text>
              <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
                total hours
              </Text>
            </View>
          </View>

          {students.length === 0 ? (
            <View className="mx-6 bg-white rounded-2xl p-6 items-center" style={shadows.card}>
              <Ionicons name="leaf-outline" size={36} color={colors.text.muted} />
              <Text style={{ fontFamily: fonts.bold }} className="text-[18px] text-charcoal mt-3 mb-1">
                no students yet
              </Text>
              <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
                students who sign up with "{profile?.school_name}" will appear here.
              </Text>
            </View>
          ) : (
            <View className="px-6 gap-3">
              <Text style={{ fontFamily: fonts.semibold }} className="text-[13px] text-charcoal mb-1">
                students · sorted by hours
              </Text>
              {students.map((student, index) => (
                <View key={student.id} className="bg-white rounded-2xl p-4" style={shadows.card}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text style={{ fontFamily: fonts.bold }} className="text-[#7e9488] text-sm w-6 text-right">
                        {index + 1}
                      </Text>
                      <Text style={{ fontFamily: fonts.semibold }} className="text-[15px] text-charcoal flex-1">
                        {student.full_name}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={13} color={colors.gold.default} />
                        <Text style={{ fontFamily: fonts.bold }} className="text-gold text-sm">
                          {student.verified_hours.toFixed(1)}h
                        </Text>
                      </View>
                      <Text style={{ fontFamily: fonts.regular }} className="text-[10px] text-[#7e9488] mt-0.5">
                        level {student.level}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View className="px-6 mt-10">
        <Button label="sign out" variant="danger" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}
