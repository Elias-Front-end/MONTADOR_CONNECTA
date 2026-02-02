import { create } from 'zustand';
import { supabase } from './supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'montador' | 'partner' | 'admin';
  full_name?: string;
  company_name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  checkUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: null, loading: false });
        return;
      }

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        set({ user: profile as UserProfile, loading: false });
      } else {
        // Fallback if profile doesn't exist yet (shouldn't happen with triggers)
        set({ 
          user: { 
            id: session.user.id, 
            email: session.user.email!, 
            role: session.user.user_metadata.role || 'montador' 
          }, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      set({ user: null, loading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
