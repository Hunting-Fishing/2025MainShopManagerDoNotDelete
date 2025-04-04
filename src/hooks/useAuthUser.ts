
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        // Convert Supabase user to our AuthUser type
        if (supabaseUser) {
          const authUser: AuthUser = {
            id: supabaseUser.id,
            email: supabaseUser.email
          };
          setUser(authUser);
          setIsAuthenticated(true);
          
          // Get user profile if available
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', authUser.id)
            .single();
            
          if (profile) {
            setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
          } else {
            setUserName(authUser.email || 'User');
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      
      if (currentUser) {
        const authUser: AuthUser = {
          id: currentUser.id,
          email: currentUser.email
        };
        setUser(authUser);
        setIsAuthenticated(true);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', currentUser.id)
          .single();
          
        if (profile) {
          setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        } else {
          setUserName(currentUser.email || 'User');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserName('');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    userId: user?.id || null,
    loading,
    isLoading: loading, // Add isLoading as an alias for loading for compatibility
    userName,
    isAuthenticated,
    isAdmin: false, // Adding this for compatibility with code that expects it
  };
}
