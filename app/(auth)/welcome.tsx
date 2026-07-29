import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { fonts } from '../../constants/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[52px] text-brand leading-none">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.bold }} className="text-[18px] text-charcoal mt-3 text-center">
          doing good shouldn't be hard.
        </Text>
      </View>

      <View className="px-8 pb-14 gap-3">
        <Button label="i'm a student" onPress={() => router.push('/(auth)/sign-up-student')} />
        <Button label="i'm an organization" variant="ghost" onPress={() => router.push('/(auth)/sign-up-org')} />
        <TouchableOpacity className="items-center py-3" onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">
            already have an account?{' '}
            <Text style={{ fontFamily: fonts.semibold }} className="text-brand">
              sign in
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
