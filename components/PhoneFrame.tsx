import { ReactNode } from 'react';
import { View, Text, Platform, useWindowDimensions } from 'react-native';
import { fonts } from '../constants/theme';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const MIN_FRAMED_WIDTH = 700;
const MIN_CAPTION_WIDTH = 1050;
const BEZEL = 12;
const FRAME_WIDTH = PHONE_WIDTH + BEZEL * 2;
const FRAME_HEIGHT = PHONE_HEIGHT + BEZEL * 2;

interface PhoneFrameProps {
  children: ReactNode;
}

// Always renders the same two nested Views and only changes their styles. Swapping
// between a framed and unframed tree on resize would remount the app and lose its state.
export function PhoneFrame({ children }: PhoneFrameProps) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= MIN_FRAMED_WIDTH;
  const showCaption = framed && width >= MIN_CAPTION_WIDTH;
  // Shrink the whole phone on short windows instead of squashing it, so screens keep a real phone's layout
  const scale = Math.min(1, (height - 48) / FRAME_HEIGHT);

  return (
    <View className={framed ? 'flex-1 flex-row items-center justify-center gap-20 bg-[#e9eee7]' : 'flex-1'}>
      {showCaption && <Caption />}
      <View
        className={framed ? 'rounded-[52px] border-charcoal overflow-hidden bg-cream' : 'flex-1'}
        style={
          framed
            ? {
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                borderWidth: BEZEL,
                transform: [{ scale }],
                // transform doesn't shrink the layout box, so pull the caption back in by the difference
                marginHorizontal: (-FRAME_WIDTH * (1 - scale)) / 2,
                shadowColor: '#1c2620',
                shadowOpacity: 0.25,
                shadowRadius: 40,
                shadowOffset: { width: 0, height: 20 },
              }
            : undefined
        }
      >
        {children}
      </View>
    </View>
  );
}

function Caption() {
  const features = [
    'swipe to discover local volunteer opportunities',
    'log hours and get them verified by organizations',
    'earn xp and level up as you give back',
  ];

  return (
    <View className="max-w-[340px]">
      <Text style={{ fontFamily: fonts.extrabold }} className="text-[44px] text-brand leading-none">
        greenie
      </Text>
      <Text style={{ fontFamily: fonts.bold }} className="text-[18px] text-charcoal mt-3 leading-7">
        a gamified volunteering app for high school students on the East End of Long Island.
      </Text>
      <View className="mt-6 gap-2.5">
        {features.map((feature) => (
          <View key={feature} className="flex-row gap-2.5">
            <Text style={{ fontFamily: fonts.bold }} className="text-brand">✓</Text>
            <Text style={{ fontFamily: fonts.regular }} className="text-[15px] text-[#4a5e54] flex-1">
              {feature}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488] mt-8 leading-5">
        Built with React Native, Expo, and Supabase. This preview runs entirely on sample data:
        the places are real, but the organizations and people are made up.
      </Text>
    </View>
  );
}
