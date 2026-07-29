import { useRef, ReactNode } from 'react';
import { Animated, PanResponder, Dimensions, Text } from 'react-native';
import { colors, fonts } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
}

export function SwipeCard({ children, onSwipeLeft, onSwipeRight, onTap }: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const tapStartX = useRef(0);
  const tapStartY = useRef(0);

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
          swipeOut('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeOut('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  function swipeOut(direction: 'left' | 'right') {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      direction === 'right' ? onSwipeRight() : onSwipeLeft();
    });
  }

  function resetPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  }

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
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
    </Animated.View>
  );
}
