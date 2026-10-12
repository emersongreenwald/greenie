import { useRef, ReactNode } from 'react';
import { Animated, PanResponder, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../constants/theme';

// Sized from the card, not the window: on a desktop browser the window is ~1440px wide,
// which made the threshold impossible to reach inside the phone frame.
const CARD_WIDTH = 320; // OpportunityCard's w-80
const SWIPE_THRESHOLD = CARD_WIDTH * 0.3;
const SWIPE_OUT_DISTANCE = CARD_WIDTH * 2;
const SWIPE_OUT_DURATION = 250;
// Browsers have no native animation thread, so react-native-web warns on every animation.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const IS_WEB = Platform.OS === 'web';

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
  isFull?: boolean;
}

export function SwipeCard({ children, onSwipeLeft, onSwipeRight, onTap, isFull = false }: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const tapStartX = useRef(0);
  const tapStartY = useRef(0);
  const fullMessageOpacity = useRef(new Animated.Value(0)).current;
  // Blocks a second swipe (e.g. a double-clicked button) while the card is flying out
  const isSwipingRef = useRef(false);

  // Mutable ref so the panResponder closure always reads the current prop value
  const isFullRef = useRef(isFull);
  isFullRef.current = isFull;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gesture) => {
        tapStartX.current = gesture.x0;
        tapStartY.current = gesture.y0;
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const moved = Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
        if (!moved) {
          onTap();
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          attemptSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          attemptSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // Shared by drag gestures and the web buttons so both obey the "full" rule
  function attemptSwipe(direction: 'left' | 'right') {
    if (isSwipingRef.current) return;
    if (direction === 'right' && isFullRef.current) {
      resetPosition();
      Animated.sequence([
        Animated.timing(fullMessageOpacity, { toValue: 1, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.delay(1200),
        Animated.timing(fullMessageOpacity, { toValue: 0, duration: 300, useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
      return;
    }
    swipeOut(direction);
  }

  function swipeOut(direction: 'left' | 'right') {
    isSwipingRef.current = true;
    const x = direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      direction === 'right' ? onSwipeRight() : onSwipeLeft();
    });
  }

  function resetPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  const rotate = position.x.interpolate({
    inputRange: [-CARD_WIDTH, 0, CARD_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const joinOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const skipOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className={IS_WEB ? 'items-center select-none cursor-grab' : undefined}>
      <Animated.View
        style={{
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        }}
        {...panResponder.panHandlers}
      >
        {children}

        {/* Join badge — suppressed when full */}
        {!isFull && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              opacity: joinOpacity,
              transform: [{ rotate: '-12deg' }],
              borderWidth: 2.5,
              borderColor: colors.brand.default,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 16, color: colors.brand.default }}>
              join
            </Text>
          </Animated.View>
        )}

        {/* Skip badge */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            opacity: skipOpacity,
            transform: [{ rotate: '12deg' }],
            borderWidth: 2.5,
            borderColor: '#a09488',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 16, color: '#a09488' }}>
            skip
          </Text>
        </Animated.View>

        {/* "Full" message — fades in and out when user tries to swipe right on a full card */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            opacity: fullMessageOpacity,
            transform: [{ rotate: '-12deg' }],
            borderWidth: 2.5,
            borderColor: colors.error,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 16, color: colors.error }}>
            full
          </Text>
        </Animated.View>
      </Animated.View>

      {IS_WEB && (
        <View className="flex-row gap-6 mt-6">
          <TouchableOpacity
            onPress={() => attemptSwipe('left')}
            className="w-14 h-14 rounded-full bg-white items-center justify-center border border-[#e0d9d0] cursor-pointer"
            accessibilityLabel="skip"
          >
            <Ionicons name="close" size={26} color="#a09488" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => attemptSwipe('right')}
            className="w-14 h-14 rounded-full bg-brand items-center justify-center cursor-pointer"
            accessibilityLabel="join"
          >
            <Ionicons name="checkmark" size={26} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
