import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signIn, getProfile } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { fonts } from '../../constants/theme';

export default function SignIn() {
  const router = useRouter();
  const { setSession, setProfile } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError('');
    setLoading(true);
    try {
      const user = await signIn(email.trim(), password);
      const profile = await getProfile(user.id);
      setProfile(profile);
      if (profile.account_type === 'student') {
        router.replace('/(student)/discover');
      } else {
        router.replace('/(org)/dashboard');
      }
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
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: fonts.extrabold }} className="text-[28px] text-brand mb-1">
          greenie
        </Text>
        <Text style={{ fontFamily: fonts.bold }} className="text-[24px] text-charcoal mb-1">
          welcome back.
        </Text>
        <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm mb-8">
          good to see you again.
        </Text>

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
          label="sign in"
          loadingLabel="signing in…"
          onPress={handleSignIn}
          loading={loading}
        />

        <View className="flex-row justify-center flex-wrap gap-1 mt-6">
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">new here?</Text>
          <Link href="/(auth)/sign-up-student">
            <Text style={{ fontFamily: fonts.semibold }} className="text-brand text-sm">student sign up</Text>
          </Link>
          <Text style={{ fontFamily: fonts.regular }} className="text-[#7e9488] text-sm">or</Text>
          <Link href="/(auth)/sign-up-org">
            <Text style={{ fontFamily: fonts.semibold }} className="text-brand text-sm">organization sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
