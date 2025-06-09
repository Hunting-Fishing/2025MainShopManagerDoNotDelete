
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    console.log('useAuthUser: Setting up auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuthUser: Auth state change:', event, session?.user?.id);
        
        // Update session and user state immediately
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setUserId(session?.user?.id ?? null);
        setUserName(session?.user?.email ?? null);
        
        // For now, don't check roles to avoid potential issues
        setIsAdmin(false);
        setIsOwner(false);
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('useAuthUser: Error getting session:', error);
        } else {
          console.log('useAuthUser: Initial session check:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          setUserId(session?.user?.id ?? null);
          setUserName(session?.user?.email ?? null);
        }
      } catch (error) {
        console.error('useAuthUser: Error in initial auth check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('useAuthUser: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    isOwner,
    userId,
    userName,
  };
}
