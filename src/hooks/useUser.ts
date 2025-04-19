
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id?: string;
  email?: string;
  displayName?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current auth state
    const fetchUser = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile info from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();
          
          // Create display name from profile or email
          const displayName = profileData 
            ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
            : session.user.email?.split('@')[0] || 'User';
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.email?.split('@')[0] || 'User'
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
