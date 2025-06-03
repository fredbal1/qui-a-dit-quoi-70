
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  pseudo: string;
  email: string;
  avatar: string;
  created_at: string;
}

interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Auth Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, pseudo: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Utility
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  loading: false,
  initialized: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Basic setters
        setUser: (user) => set({ user }),
        setProfile: (profile) => set({ profile }),
        setLoading: (loading) => set({ loading }),
        setInitialized: (initialized) => set({ initialized }),

        // Sign in
        signIn: async (email, password) => {
          set({ loading: true });
          
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) throw error;

            // Fetch user profile
            if (data.user) {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (!profileError && profile) {
                set({ profile });
              }
            }

            set({ user: data.user, loading: false });
            return { success: true };
          } catch (error: any) {
            set({ loading: false });
            return { success: false, error: error.message };
          }
        },

        // Sign up
        signUp: async (email, password, pseudo, avatar) => {
          set({ loading: true });
          
          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  pseudo,
                  avatar,
                }
              }
            });

            if (error) throw error;

            set({ loading: false });
            return { success: true };
          } catch (error: any) {
            set({ loading: false });
            return { success: false, error: error.message };
          }
        },

        // Sign out
        signOut: async () => {
          await supabase.auth.signOut();
          set({ user: null, profile: null });
        },

        reset: () => set(initialState),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          profile: state.profile,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
