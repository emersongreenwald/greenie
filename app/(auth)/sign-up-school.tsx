import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signUp, getProfile } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { fonts } from '../../constants/theme';

export default function SignUpSchool() {
  const router = useRouter();
  const { setProfile } = useAuthStore();

  const [adminName, setAdminName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError('');
    setLoading(true);
    try {
      const user = await signUp(email.trim(), password, adminName.trim(), 'school', {
        school_name: schoolName.trim(),
      });
      const profile = await getProfile(user.id);
      setProfile(profile);
      router.replace('/(school)/dashboard');
    } catch (e) {
      setError((e as any)?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="px-6 pt-20 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[28px] text-brand mb-1">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.bold }} className="text-[24px] text-charcoal mb-1">
          school admin setup.
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm mb-8">
          you'll see every student from your school in one place.
        </Text>

        <Input
          placeholder="your name"
          value={adminName}
          onChangeText={setAdminName}
          autoCorrect={false}
        />
        <Input
          placeholder="school name (must match exactly)"
          value={schoolName}
          onChangeText={setSchoolName}
          autoCorrect={false}
          autoCapitalize="words"
        />
        <Input
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <Input
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={{ fontFamily: fonts.regular }} className="text-[#dc4f4f] text-sm mb-4">
            {error}
          </Text>
        ) : null}

        <Button
          label="create account"
          loadingLabel="creating account…"
          onPress={handleSignUp}
          loading={loading}
        />

        <View className="flex-row justify-center gap-1 mt-6">
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">
            already have an account?
          </Text>
          <Link href="/(auth)/sign-in">
            <Text style={{ fontFamily: fonts.semibold }} className="text-brand text-sm">sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
