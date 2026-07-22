import { supabase } from '../lib/supabase';
import type { AccountType, Profile } from '../types/auth';

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  accountType: AccountType
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    account_type: accountType,
    full_name: fullName,
  });
  if (profileError) throw profileError;

  return data.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
