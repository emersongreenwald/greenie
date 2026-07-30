import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOpportunitySignups, cancelSignup } from '../../../services/opportunities';
import { colors, fonts, shadows } from '../../../constants/theme';
import type { SignupEntry } from '../../../types/opportunity';

export default function OpportunitySignups() {
  const router = useRouter();
  const { opportunityId, title } = useLocalSearchParams<{
    opportunityId: string;
    title: string;
  }>();

  const [signups, setSignups] = useState<SignupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getOpportunitySignups(opportunityId);
      setSignups(data);
      setLoading(false);
    }
    load().catch(console.error);
  }, []);

  function handleRemove(studentId: string, studentName: string) {
    Alert.alert(
      'remove student',
      `remove ${studentName} from the roster for "${title}"?`,
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(studentId);
            try {
              await cancelSignup(opportunityId, studentId);
              setSignups((prev) => prev.filter((s) => s.student_id !== studentId));
            } catch (e) {
              console.error(e);
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="pt-16 px-6 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text.muted} />
          <Text style={{ fontFamily: fonts.regular }} className="text-sm text-[#7e9488]">
            back
          </Text>
        </TouchableOpacity>

        <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal">
          sign-ups
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-sm text-[#7e9488] mt-0.5" numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Count badge */}
      <View className="mx-6 mb-4 bg-white rounded-2xl px-5 py-4 flex-row items-center gap-3" style={shadows.card}>
        <Ionicons name="people-outline" size={20} color={colors.brand.default} />
        <Text style={{ fontFamily: fonts.semibold }} className="text-charcoal text-[15px]">
          {signups.length} {signups.length === 1 ? 'student' : 'students'} signed up
        </Text>
      </View>

      {/* Student list */}
      {signups.length === 0 ? (
        <View className="mx-6 bg-white rounded-2xl p-6 items-center" style={shadows.card}>
          <Ionicons name="person-add-outline" size={28} color={colors.text.muted} />
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center mt-3">
            no students have signed up yet.{'\n'}they'll appear here once they join.
          </Text>
        </View>
      ) : (
        <View className="px-6 gap-3">
          {signups.map((signup, index) => {
            const signedUpDate = new Date(signup.signed_up_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <View key={signup.student_id} className="bg-white rounded-2xl px-5 py-4 flex-row items-center gap-4" style={shadows.card}>
                <View className="w-9 h-9 rounded-full bg-brand-muted items-center justify-center">
                  <Text style={{ fontFamily: fonts.bold }} className="text-brand text-[13px]">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: fonts.semibold }} className="text-[15px] text-charcoal">
                    {signup.profiles?.full_name ?? 'Student'}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
                    {signup.profiles?.school_name
                      ? `${signup.profiles.school_name} · joined ${signedUpDate}`
                      : `joined ${signedUpDate}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    handleRemove(signup.student_id, signup.profiles?.full_name ?? 'this student')
                  }
                  disabled={removingId === signup.student_id}
                  style={{ opacity: removingId === signup.student_id ? 0.4 : 1 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="person-remove-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
