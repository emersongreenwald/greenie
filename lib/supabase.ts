import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// The public web demo is built without keys so it can never reach real student data.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Without keys, point at a reserved domain that can't resolve: importing this file
// stays safe, and any request that slips past demo mode fails instead of leaking.
export const supabase = createClient(
  supabaseUrl ?? 'https://not-configured.invalid',
  supabaseAnonKey ?? 'not-configured',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

if (isSupabaseConfigured) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
