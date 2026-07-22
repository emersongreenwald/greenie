import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile } from '../services/auth';
import type { Profile } from '../types/auth';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  initialized: false,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    let profile: Profile | null = null;
    if (session?.user) {
      try {
        profile = await getProfile(session.user.id);
      } catch {
        // No profile yet — user may be mid sign-up
      }
    }

    set({ session, profile, initialized: true });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      let profile: Profile | null = null;
      if (session?.user) {
        try {
          profile = await getProfile(session.user.id);
        } catch {
          // No profile yet
        }
      }
      set({ session, profile });
    });
  },
}));
