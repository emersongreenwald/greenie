import { View, Text } from 'react-native';
import type { Opportunity } from '../types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const date = new Date(opportunity.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View className="bg-white rounded-2xl shadow-md p-6 w-80">
      <Text className="text-xl font-bold text-gray-900 mb-1">{opportunity.title}</Text>
      <Text className="text-brand font-medium mb-4">
        {opportunity.profiles?.full_name ?? 'Organization'}
      </Text>
      <Text className="text-gray-600 mb-6 leading-6" numberOfLines={4}>
        {opportunity.description}
      </Text>
      <View className="border-t border-gray-100 pt-4 gap-2">
        <Text className="text-gray-500 text-sm">{date}</Text>
        <Text className="text-gray-500 text-sm">{opportunity.location}</Text>
        <Text className="text-brand-dark font-semibold">
          {opportunity.hours_value} {opportunity.hours_value === 1 ? 'hour' : 'hours'}
        </Text>
      </View>
    </View>
  );
}
