import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { createOpportunity } from '../../services/opportunities';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, fonts } from '../../constants/theme';

function parseDate(input: string): string | null {
  const parts = input.trim().split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  if (!month || !day || !year || year.length !== 4) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default function CreateOpportunity() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!profile) return;
    setError('');

    if (!title.trim() || !description.trim() || !location.trim() || !date.trim() || !hours.trim()) {
      setError('all fields are required.');
      return;
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      setError('date must be in mm/dd/yyyy format.');
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError('hours must be a positive number.');
      return;
    }

    let capacityNum: number | null = null;
    if (capacity.trim()) {
      capacityNum = parseInt(capacity.trim(), 10);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        setError('max volunteers must be a positive whole number.');
        return;
      }
    }

    setLoading(true);
    try {
      await createOpportunity(profile.id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: parsedDate,
        hours_value: hoursNum,
        capacity: capacityNum,
      });
      router.back();
    } catch (e) {
      setError((e as any)?.message || 'something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="pt-16 px-6 pb-6">
        <TouchableOpacity
          className="flex-row items-center gap-1 mb-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.default} />
          <Text style={{ fontFamily: fonts.medium }} className="text-brand text-sm">back</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal">
          post an opportunity
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-1">
          students in your area will discover this on their feed.
        </Text>
      </View>

      <View className="px-6">
        <Text style={{ fontFamily: fonts.semibold }} className="text-xs text-charcoal mb-1.5">
          title
        </Text>
        <Input
          placeholder="e.g. beach cleanup at Coopers Beach"
          value={title}
          onChangeText={setTitle}
          autoCapitalize="words"
        />

        <Text style={{ fontFamily: fonts.semibold }} className="text-xs text-charcoal mb-1.5">
          description
        </Text>
        <Input
          placeholder="what will students be doing?"
          value={description}
          onChangeText={setDescription}
          multiline
          autoCapitalize="sentences"
        />

        <Text style={{ fontFamily: fonts.semibold }} className="text-xs text-charcoal mb-1.5">
          location
        </Text>
        <Input
          placeholder="e.g. Coopers Beach, Southampton"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text style={{ fontFamily: fonts.semibold }} className="text-xs text-charcoal mb-1.5">
              date (mm/dd/yyyy)
            </Text>
            <Input
              placeholder="08/15/2026"
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View className="w-24">
            <Text style={{ fontFamily: fonts.semibold }} className="text-xs text-charcoal mb-1.5">
              hours
            </Text>
            <Input
              placeholder="2"
              value={hours}
              onChangeText={setHours}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={{ fontFamily: fonts.semibold }} className="text-xs text-charcoal mb-1.5">
          max volunteers{' '}
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488]">(optional)</Text>
        </Text>
        <Input
          placeholder="leave blank for unlimited"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />

        {error ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-[#dc4f4f] text-sm mb-4">
            {error}
          </Text>
        ) : null}

        <Button
          label="post it"
          loadingLabel="posting…"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}
