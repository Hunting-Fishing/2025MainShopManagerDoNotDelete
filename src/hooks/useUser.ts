
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email?: string;
  displayName?: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the current user from Supabase auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }
        
        if (!authUser) {
          setUser(null);
          return;
        }
        
        // Get the user's profile from our profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', authUser.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.warn("Error fetching profile:", profileError);
        }
        
        setUser({
          id: authUser.id,
          email: authUser.email || undefined,
          displayName: profileData 
            ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
            : authUser.email || '',
        });
        
      } catch (error: any) {
        console.error("Error in useUser hook:", error);
        setError(error.message || "An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined,
          displayName: session.user.email || '',
        });
      } else {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { user, loading, error };
};
