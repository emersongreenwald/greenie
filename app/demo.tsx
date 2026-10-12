import { View, Text, Image } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { signInAsDemo } from '../services/demo/demoDb';
import { useAuthStore } from '../stores/useAuthStore';
import { IS_DEMO } from '../lib/demo';
import { fonts } from '../constants/theme';

export default function DemoPicker() {
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);

  if (!IS_DEMO) return <Redirect href="/" />;

  function enterAs(role: 'student' | 'org') {
    setProfile(signInAsDemo(role));
    router.replace(role === 'student' ? '/(student)/discover' : '/(org)/dashboard');
  }

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={require('../assets/frog.png')}
          style={{ width: 120, height: 106 }}
          resizeMode="contain"
        />
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[48px] text-brand leading-none mt-5">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.bold }} className="text-[18px] text-charcoal mt-3 text-center">
          doing good shouldn't be hard.
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-sm text-[#7e9488] mt-4 text-center leading-5">
          students find local volunteer work, log their hours, and level up when an organization verifies them.
        </Text>
      </View>

      <View className="px-8 pb-12 gap-3">
        <Button label="explore as a student" onPress={() => enterAs('student')} />
        <Button label="explore as an organization" variant="ghost" onPress={() => enterAs('org')} />
        <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-xs text-center mt-2">
          try it: join an event, log hours as the student, then{'\n'}switch to the organization to verify them.
        </Text>
      </View>
    </View>
  );
}
