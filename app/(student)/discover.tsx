import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SwipeCard } from '../../components/SwipeCard';
import { OpportunityCard } from '../../components/OpportunityCard';
import { getOpportunities, signUpForOpportunity } from '../../services/opportunities';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../constants/theme';
import type { Opportunity } from '../../types/opportunity';

export default function Discover() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOpportunities()
      .then(setOpportunities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleSwipeLeft() {
    setCurrentIndex((i) => i + 1);
  }

  async function handleSwipeRight() {
    const opportunity = opportunities[currentIndex];
    if (!profile) return;
    try {
      await signUpForOpportunity(opportunity.id, profile.id);
    } catch {
      // Already signed up — still advance
    }
    setCurrentIndex((i) => i + 1);
  }

  function handleTap() {
    router.push(`/(student)/opportunity/${opportunities[currentIndex].id}`);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  if (currentIndex >= opportunities.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-2xl font-bold text-gray-900 mb-3">You're all caught up</Text>
        <Text className="text-gray-500 text-center">
          No more opportunities right now. Check back soon.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6">
        <Text className="text-2xl font-bold text-gray-900">Discover</Text>
        <Text className="text-gray-500">Swipe right to sign up · Tap to learn more</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        {opportunities[currentIndex + 1] && (
          <View className="absolute opacity-60 scale-95">
            <OpportunityCard opportunity={opportunities[currentIndex + 1]} />
          </View>
        )}

        <SwipeCard
          key={currentIndex}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onTap={handleTap}
        >
          <OpportunityCard opportunity={opportunities[currentIndex]} />
        </SwipeCard>
      </View>

      <View className="pb-12 items-center">
        <Text className="text-gray-400 text-sm">
          {opportunities.length - currentIndex} remaining
        </Text>
      </View>
    </View>
  );
}
