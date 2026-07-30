import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOrgOpportunities, deleteOpportunity } from '../../services/opportunities';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, fonts, shadows } from '../../constants/theme';
import type { Opportunity } from '../../types/opportunity';

export default function OrgOpportunities() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function load() {
    if (!profile) return;
    const data = await getOrgOpportunities(profile.id);
    setOpportunities(data);
    setLoading(false);
  }

  function handleDelete(id: string) {
    Alert.alert(
      'delete opportunity',
      'students who signed up will no longer see this. are you sure?',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await deleteOpportunity(id);
              setOpportunities((prev) => prev.filter((o) => o.id !== id));
            } catch (e) {
              console.error(e);
            } finally {
              setDeletingId(null);
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
      <View className="pt-16 px-6 pb-4">
        <TouchableOpacity
          className="flex-row items-center gap-1 mb-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.default} />
          <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm">back</Text>
        </TouchableOpacity>
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal">
            your opportunities
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-1 bg-brand rounded-xl px-3 py-2"
            onPress={() => router.push('/(org)/create-opportunity')}
          >
            <Ionicons name="add" size={14} color="white" />
            <Text style={{ fontFamily: fonts.semibold }} className="text-white text-[13px]">
              post new
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {opportunities.length === 0 ? (
        <View className="items-center justify-center px-8 pt-16">
          <Ionicons name="leaf-outline" size={40} color={colors.text.muted} />
          <Text style={{ fontFamily: fonts.bold }} className="text-[20px] text-charcoal mt-4 mb-2">
            nothing posted yet
          </Text>
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
            post your first opportunity and students will start discovering it.
          </Text>
        </View>
      ) : (
        <View className="px-6 gap-4">
          {opportunities.map((opp) => {
            const dateStr = new Date(opp.date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const isDeleting = deletingId === opp.id;
            return (
              <View key={opp.id} className="bg-white rounded-2xl p-5" style={shadows.card}>
                <View className="flex-row items-start justify-between gap-3">
                  <Text style={{ fontFamily: fonts.semibold }} className="text-[15px] text-charcoal flex-1">
                    {opp.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(opp.id)}
                    disabled={isDeleting}
                    style={{ opacity: isDeleting ? 0.4 : 1 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-4 mt-2">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={13} color={colors.gold.default} />
                    <Text style={{ fontFamily: fonts.semibold }} className="text-gold text-sm">
                      {Number(opp.hours_value).toFixed(1)}h
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="calendar-outline" size={13} color={colors.text.muted} />
                    <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">
                      {dateStr}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-1.5 mt-1.5">
                  <Ionicons name="location-outline" size={13} color={colors.text.muted} />
                  <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">
                    {opp.location}
                  </Text>
                </View>

                <TouchableOpacity
                  className="mt-4 flex-row items-center justify-between border-t border-[#e0d9d0] pt-3"
                  onPress={() =>
                    router.push({
                      pathname: '/(org)/opportunity-signups/[opportunityId]',
                      params: { opportunityId: opp.id, title: opp.title },
                    })
                  }
                >
                  <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm">
                    view sign-up roster
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.brand.default} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
