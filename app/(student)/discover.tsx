import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SwipeCard } from '../../components/SwipeCard';
import { OpportunityCard } from '../../components/OpportunityCard';
import { getOpportunities, signUpForOpportunity } from '../../services/opportunities';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, fonts } from '../../constants/theme';
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
    // Guard: SwipeCard prevents swipe-right on full cards, but be safe
    const isFull =
      opportunity.capacity != null &&
      (opportunity.signup_count ?? 0) >= opportunity.capacity;
    if (isFull) return;
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
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.brand.default} />
      </View>
    );
  }

  if (currentIndex >= opportunities.length) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Text style={{ fontFamily: fonts.bold }} className="text-[22px] text-charcoal mb-3">
          you're all caught up
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm text-center">
          no more opportunities right now.{'\n'}check back soon.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <View className="pt-16 pb-4 px-6">
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[28px] text-brand">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-0.5">
          swipe right to join · tap to learn more
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        {opportunities[currentIndex + 1] && (
          <View className="absolute opacity-50" style={{ transform: [{ scale: 0.94 }] }}>
            <OpportunityCard opportunity={opportunities[currentIndex + 1]} />
          </View>
        )}

        <SwipeCard
          key={currentIndex}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onTap={handleTap}
          isFull={
            opportunities[currentIndex].capacity != null &&
            (opportunities[currentIndex].signup_count ?? 0) >= opportunities[currentIndex].capacity!
          }
        >
          <OpportunityCard opportunity={opportunities[currentIndex]} />
        </SwipeCard>
      </View>

      <View className="pb-4 items-center">
        <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488]">
          {opportunities.length - currentIndex} remaining
        </Text>
      </View>
    </View>
  );
}
