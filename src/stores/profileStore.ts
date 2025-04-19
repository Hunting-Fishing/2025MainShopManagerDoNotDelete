
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  job_title?: string;
  department?: string;
  updated_at?: string;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  
  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      set({ profile: data, loading: false });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      set({ 
        error: error.message || 'Failed to fetch profile', 
        loading: false 
      });
    }
  },
  
  updateProfile: async (updates: Partial<Profile>) => {
    const { profile } = get();
    if (!profile) return;
    
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
        
      if (error) {
        throw error;
      }
      
      set({ 
        profile: { ...profile, ...updates },
        loading: false
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      set({ 
        error: error.message || 'Failed to update profile', 
        loading: false 
      });
    }
  }
}));
