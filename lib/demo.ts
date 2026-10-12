import { isSupabaseConfigured } from './supabase';

// The public web build ships without Supabase keys, so it always runs on sample data.
// Locally, `npm run web:demo` starts the app without keys to preview the same thing.
export const IS_DEMO = !isSupabaseConfigured;
