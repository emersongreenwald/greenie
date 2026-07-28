import { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, StyleSheet } from 'react-native';

const { width: W } = Dimensions.get('window');

const COLORS = [
  '#FFB3C6', // pastel pink
  '#FFF2B3', // pastel yellow
  '#B3D9FF', // pastel blue
  '#FFD4B3', // pastel peach
  '#B3F0D9', // pastel mint
  '#F0B3FF', // pastel lavender
];

const COUNT = 38;

function makeParticle() {
  return {
    y:       new Animated.Value(0),
    x:       new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotate:  new Animated.Value(0),
    color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    startX:  W * 0.05 + Math.random() * W * 0.9,
    w:       Math.random() * 7 + 4,
    h:       Math.random() * 9 + 5,
  };
}

export function Confetti() {
  const particles = useRef(Array.from({ length: COUNT }, makeParticle)).current;

  useEffect(() => {
    particles.forEach((p) => {
      const delay = Math.random() * 150;
      const dur   = 900 + Math.random() * 400;
      const toY   = 500 + Math.random() * 250;
      const toX   = (Math.random() - 0.5) * 180;
      const toR   = (Math.random() - 0.5) * 10;

      // opacity sequence total = 60 + (dur*0.5 - 60) + dur*0.5 = dur — matches movement
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: toY, duration: dur,
            easing: Easing.bezier(0.2, 0, 0.8, 1),
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: toX, duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: toR, duration: dur,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.delay(dur * 0.5 - 60),
            Animated.timing(p.opacity, { toValue: 0, duration: dur * 0.5, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange:  [-10, 10],
          outputRange: ['-1800deg', '1800deg'],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position:        'absolute',
              top:             0,
              left:            p.startX,
              width:           p.w,
              height:          p.h,
              backgroundColor: p.color,
              borderRadius:    2,
              opacity:         p.opacity,
              transform:       [{ translateX: p.x }, { translateY: p.y }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
