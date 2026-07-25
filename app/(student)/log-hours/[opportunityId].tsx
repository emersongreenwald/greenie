import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { logHours } from '../../../services/hours';
import { useAuthStore } from '../../../stores/useAuthStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function LogHours() {
  const { opportunityId, title, hoursValue } = useLocalSearchParams<{
    opportunityId: string;
    title: string;
    hoursValue: string;
  }>();
  const router = useRouter();
  const { profile } = useAuthStore();

  const today = new Date().toISOString().split('T')[0];

  const [hours, setHours] = useState(hoursValue ?? '');
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!profile) return;

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      setError('Please enter a valid number of hours (between 0 and 24).');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Please enter the date as YYYY-MM-DD, for example ' + today + '.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await logHours(opportunityId, profile.id, hoursNum, date, description.trim());
      setSubmitted(true);
    } catch (e) {
      setError((e as any)?.message || 'Failed to submit hours.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-2xl font-bold text-gray-900 mb-3">Hours submitted</Text>
        <Text className="text-gray-500 text-center mb-8">
          Your hours are pending verification by the organization. You'll see the status on your
          dashboard.
        </Text>
        <Button
          label="Back to dashboard"
          onPress={() => router.replace('/(student)/dashboard')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="px-6 pt-16 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-brand font-medium mb-4" onPress={() => router.back()}>
          ← Back
        </Text>

        <Text className="text-2xl font-bold text-gray-900 mb-1">Log your hours</Text>
        {title ? <Text className="text-gray-500 mb-8">{title}</Text> : null}

        <Text className="text-gray-700 font-medium mb-1">Hours completed</Text>
        <Input
          placeholder="e.g. 2.5"
          value={hours}
          onChangeText={setHours}
          keyboardType="decimal-pad"
          autoCorrect={false}
        />

        <Text className="text-gray-700 font-medium mb-1">Date of service (YYYY-MM-DD)</Text>
        <Input
          placeholder={today}
          value={date}
          onChangeText={setDate}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text className="text-gray-700 font-medium mb-1">
          What did you do?{' '}
          <Text className="text-gray-400 font-normal">(optional)</Text>
        </Text>
        <Input
          placeholder="Briefly describe your service…"
          value={description}
          onChangeText={setDescription}
        />

        {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}

        <Button
          label="Submit hours"
          loadingLabel="Submitting…"
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
