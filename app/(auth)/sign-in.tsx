import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signIn, getProfile } from '../../services/auth';
import { useAuthStore } from '../../stores/useAuthStore';

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
        router.replace('/(student)/dashboard');
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
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-green-600 mb-2">Greenie</Text>
        <Text className="text-gray-500 mb-8">Sign in to continue</Text>

        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base mb-4"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}

        <TouchableOpacity
          className="bg-green-600 rounded-lg py-4 items-center mb-6"
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? 'Signing in…' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center gap-1">
          <Text className="text-gray-500">New here?</Text>
          <Link href="/(auth)/sign-up-student">
            <Text className="text-green-600 font-medium">Student sign up</Text>
          </Link>
          <Text className="text-gray-500">or</Text>
          <Link href="/(auth)/sign-up-org">
            <Text className="text-green-600 font-medium">Organization sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
