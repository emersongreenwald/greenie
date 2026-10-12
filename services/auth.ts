import { supabase } from '../lib/supabase';
import { IS_DEMO } from '../lib/demo';
import * as demo from './demo/demoDb';
import type { AccountType, Profile } from '../types/auth';

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  accountType: AccountType,
  extra?: { school_name?: string; graduation_year?: number; phone?: string }
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    account_type: accountType,
    full_name: fullName,
    ...extra,
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
  if (IS_DEMO) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile> {
  if (IS_DEMO) return demo.getProfile(userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
