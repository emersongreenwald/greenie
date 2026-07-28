import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { logHours } from '../../../services/hours';
import { useAuthStore } from '../../../stores/useAuthStore';
import { Confetti } from '../../../components/Confetti';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors, fonts } from '../../../constants/theme';

const ENCOURAGE = [
  'the community thanks you.',
  'keep growing.',
  'you showed up!',
  'making a difference.',
  'every hour counts.',
];

export default function LogHours() {
  const { opportunityId, title, hoursValue } = useLocalSearchParams<{
    opportunityId: string;
    title: string;
    hoursValue: string;
  }>();
  const router  = useRouter();
  const { profile } = useAuthStore();

  const today = new Date().toISOString().split('T')[0];

  const [hours, setHours]             = useState(hoursValue ?? '');
  const [date, setDate]               = useState(today);
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit() {
    if (!profile) return;

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      setError('please enter a valid number of hours (between 0 and 24).');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('please enter the date as YYYY-MM-DD, for example ' + today + '.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await logHours(opportunityId, profile.id, hoursNum, date, description.trim());
      setSuccessMessage(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
      setSubmitted(true);
    } catch (e) {
      setError((e as any)?.message || 'failed to submit hours.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Confetti />
        <Ionicons name="checkmark-circle" size={56} color={colors.brand.default} />
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[28px] text-charcoal mt-5 mb-2">
          nice work!
        </Text>
        <Text style={{ fontFamily: fonts.semibold }} className="text-[#4a5e54] text-base mb-3 text-center">
          {successMessage}
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center mb-10">
          your hours are in. your org will take a look soon — check your profile for updates.
        </Text>
        <Button
          label="back to profile"
          onPress={() => router.replace('/(student)/dashboard')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="px-6 pt-16 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          className="flex-row items-center gap-1 mb-6"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.default} />
          <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm">back</Text>
        </TouchableOpacity>

        <Text style={{ fontFamily: fonts.bold }} className="text-[24px] text-charcoal mb-1">
          log your hours
        </Text>
        {title ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm mb-8">
            {title}
          </Text>
        ) : null}

        <Text style={{ fontFamily: fonts.semibold }} className="text-[13px] text-charcoal mb-1.5">
          hours completed
        </Text>
        <Input
          placeholder="e.g. 2.5"
          value={hours}
          onChangeText={setHours}
          keyboardType="decimal-pad"
          autoCorrect={false}
        />

        <Text style={{ fontFamily: fonts.semibold }} className="text-[13px] text-charcoal mb-1.5">
          date of service (YYYY-MM-DD)
        </Text>
        <Input
          placeholder={today}
          value={date}
          onChangeText={setDate}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text style={{ fontFamily: fonts.semibold }} className="text-[13px] text-charcoal mb-1.5">
          what did you do?{' '}
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488]">(optional)</Text>
        </Text>
        <Input
          placeholder="briefly describe your service…"
          value={description}
          onChangeText={setDescription}
        />

        {error ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-[#dc4f4f] text-sm mb-4">
            {error}
          </Text>
        ) : null}

        <Button
          label="submit hours"
          loadingLabel="submitting…"
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
