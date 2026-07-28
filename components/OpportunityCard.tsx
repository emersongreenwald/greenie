import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, shadows } from '../constants/theme';
import type { Opportunity } from '../types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const date = new Date(opportunity.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View className="bg-white rounded-3xl p-6 w-80" style={shadows.card}>
      <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal mb-1" numberOfLines={2}>
        {opportunity.title}
      </Text>
      <Text style={{ fontFamily: fonts.medium }} className="text-brand mb-4">
        {opportunity.profiles?.full_name ?? 'Organization'}
      </Text>
      <Text style={{ fontFamily: fonts.regular }} className="text-[#4a5e54] mb-6 leading-6" numberOfLines={4}>
        {opportunity.description}
      </Text>
      <View className="border-t border-[#e0d9d0] pt-4 gap-2.5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={13} color="#7e9488" />
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">{date}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="location-outline" size={13} color="#7e9488" />
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">{opportunity.location}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={13} color="#c9a050" />
          <Text style={{ fontFamily: fonts.semibold }} className="text-gold text-sm">
            {opportunity.hours_value} {opportunity.hours_value === 1 ? 'hour' : 'hours'}
          </Text>
        </View>
      </View>
    </View>
  );
}
