import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signInAsDemo } from '../services/demo/demoDb';
import { useAuthStore } from '../stores/useAuthStore';
import { fonts } from '../constants/theme';

export function DemoBanner() {
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const otherRole = profile?.account_type === 'student' ? 'org' : 'student';

  function switchView() {
    setProfile(signInAsDemo(otherRole));
    router.replace(otherRole === 'student' ? '/(student)/dashboard' : '/(org)/dashboard');
  }

  return (
    <View className="flex-row items-center justify-between px-4 py-2 bg-brand-muted border-b border-brand-border">
      <Text style={{ fontFamily: fonts.semibold }} className="text-[11px] text-brand-dark">
        Demo mode · sample opportunities
      </Text>
      {profile && (
        <TouchableOpacity onPress={switchView}>
          <Text style={{ fontFamily: fonts.semibold }} className="text-[11px] text-brand underline">
            switch to {otherRole === 'org' ? 'organization' : 'student'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
