import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signUp, getProfile } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SignUpStudent() {
  const router = useRouter();
  const { setProfile } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError('');
    setLoading(true);
    try {
      const user = await signUp(email.trim(), password, fullName.trim(), 'student');
      const profile = await getProfile(user.id);
      setProfile(profile);
      router.replace('/(student)/discover');
    } catch (e) {
      setError((e as any)?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-brand mb-2">Student sign up</Text>
        <Text className="text-gray-500 mb-8">Create your Greenie account</Text>

        <Input
          placeholder="Full name"
          value={fullName}
          onChangeText={setFullName}
          autoCorrect={false}
        />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}

        <Button
          label="Create account"
          loadingLabel="Creating account…"
          onPress={handleSignUp}
          loading={loading}
        />

        <View className="flex-row justify-center gap-1 mt-6">
          <Text className="text-gray-500">Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-brand font-medium">Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
