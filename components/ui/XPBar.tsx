import { View, Text, Animated, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { fonts } from '../../constants/theme';

interface XPBarProps {
  xp: number;
  level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
  const xpIntoLevel    = xp % 100;
  const progressPercent = Math.min(Math.round((xpIntoLevel / 100) * 100), 100);

  const [containerWidth, setContainerWidth] = useState(0);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth === 0) return;
    Animated.timing(widthAnim, {
      toValue:  containerWidth * (progressPercent / 100),
      duration: 900,
      delay:    150,
      easing:   Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [containerWidth]);

  return (
    <View>
      <View
        className="h-2 bg-[#f0ebe0] rounded-full overflow-hidden"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View className="h-2 bg-gold rounded-full" style={{ width: widthAnim }} />
      </View>
      <View className="flex-row justify-between mt-1.5">
        <Text style={{ fontFamily: fonts.semibold }} className="text-gold-dark text-xs">
          {xp} xp
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-xs text-[#7e9488]">
          next level in {100 - xpIntoLevel} xp
        </Text>
      </View>
    </View>
  );
}
