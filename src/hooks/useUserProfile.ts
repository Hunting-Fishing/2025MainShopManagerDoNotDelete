
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuthUser } from './useAuthUser';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuthUser();

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, job_title')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      setUserProfile({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        jobTitle: data.job_title || ''
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Map the form values back to the database column names
      const updateData: Record<string, any> = {};
      if ('firstName' in profileData) updateData.first_name = profileData.firstName;
      if ('lastName' in profileData) updateData.last_name = profileData.lastName;
      if ('email' in profileData) updateData.email = profileData.email;
      if ('phone' in profileData) updateData.phone = profileData.phone;
      if ('jobTitle' in profileData) updateData.job_title = profileData.jobTitle;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local state with new values
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...profileData
        });
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    error,
    fetchUserProfile,
    updateProfile
  };
}
