import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOpportunity, signUpForOpportunity, getStudentSignups } from '../../../services/opportunities';
import { useAuthStore } from '../../../stores/useAuthStore';
import { Button } from '../../../components/ui/Button';
import { colors, fonts, shadows } from '../../../constants/theme';
import type { Opportunity } from '../../../types/opportunity';

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [alreadySignedUp, setAlreadySignedUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const [opp, signups] = await Promise.all([
        getOpportunity(id),
        getStudentSignups(profile.id),
      ]);
      setOpportunity(opp);
      setAlreadySignedUp(signups.includes(id));
      setLoading(false);
    }
    load().catch(console.error);
  }, [id]);

  async function handleSignUp() {
    if (!opportunity || !profile) return;
    setSigningUp(true);
    setError('');
    try {
      await signUpForOpportunity(opportunity.id, profile.id);
      setAlreadySignedUp(true);
    } catch (e) {
      setError((e as any)?.message || 'sign up failed');
    } finally {
      setSigningUp(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  if (!opportunity) return null;

  const date = new Date(opportunity.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView className="flex-1 bg-cream">
      <TouchableOpacity
        className="pt-16 px-6 pb-4 flex-row items-center gap-1"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={16} color={colors.brand.default} />
        <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm">back</Text>
      </TouchableOpacity>

      <View className="px-6">
        <Text style={{ fontFamily: fonts.bold }} className="text-[24px] text-charcoal mb-1">
          {opportunity.title}
        </Text>
        <Text style={{ fontFamily: fonts.medium }} className="text-brand mb-6">
          {opportunity.profiles?.full_name ?? 'Organization'}
        </Text>

        <View className="bg-white rounded-2xl p-4 mb-6 gap-3" style={shadows.card}>
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="calendar-outline" size={15} color={colors.text.muted} />
            <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] text-sm">{date}</Text>
          </View>
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="location-outline" size={15} color={colors.text.muted} />
            <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] text-sm">{opportunity.location}</Text>
          </View>
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="time-outline" size={15} color={colors.gold.default} />
            <Text style={{ fontFamily: fonts.semibold }} className="text-gold text-sm">
              {opportunity.hours_value} {opportunity.hours_value === 1 ? 'hour' : 'hours'}
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] leading-7 mb-8">
          {opportunity.description}
        </Text>

        {error ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-[#dc4f4f] mb-4 text-sm">
            {error}
          </Text>
        ) : null}

        {alreadySignedUp ? (
          <View className="bg-brand-muted border border-brand-border rounded-2xl py-4 items-center mb-8">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={16} color={colors.brand.dark} />
              <Text style={{ fontFamily: fonts.semibold }} className="text-brand-dark">you're in!</Text>
            </View>
          </View>
        ) : (
          <Button
            label="i'm in!"
            loadingLabel="signing up…"
            onPress={handleSignUp}
            loading={signingUp}
          />
        )}
      </View>
    </ScrollView>
  );
}
