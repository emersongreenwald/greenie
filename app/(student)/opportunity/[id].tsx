import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getOpportunity, signUpForOpportunity, getStudentSignups } from '../../../services/opportunities';
import { useAuthStore } from '../../../stores/useAuthStore';
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
      setError((e as any)?.message || 'Sign up failed');
    } finally {
      setSigningUp(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#16a34a" />
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
    <ScrollView className="flex-1 bg-white">
      <TouchableOpacity
        className="pt-16 px-6 pb-4"
        onPress={() => router.back()}
      >
        <Text className="text-green-600 font-medium">← Back</Text>
      </TouchableOpacity>

      <View className="px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">{opportunity.title}</Text>
        <Text className="text-green-600 font-medium mb-6">
          {opportunity.profiles?.full_name ?? 'Organization'}
        </Text>

        <View className="bg-gray-50 rounded-xl p-4 mb-6 gap-2">
          <Text className="text-gray-700">{date}</Text>
          <Text className="text-gray-700">{opportunity.location}</Text>
          <Text className="text-green-700 font-semibold">
            {opportunity.hours_value} {opportunity.hours_value === 1 ? 'hour' : 'hours'}
          </Text>
        </View>

        <Text className="text-gray-900 leading-7 mb-8">{opportunity.description}</Text>

        {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

        {alreadySignedUp ? (
          <View className="bg-green-50 border border-green-200 rounded-xl py-4 items-center mb-8">
            <Text className="text-green-700 font-semibold">You're signed up</Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 items-center mb-8"
            onPress={handleSignUp}
            disabled={signingUp}
          >
            <Text className="text-white font-semibold text-base">
              {signingUp ? 'Signing up…' : 'Sign up for this opportunity'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
