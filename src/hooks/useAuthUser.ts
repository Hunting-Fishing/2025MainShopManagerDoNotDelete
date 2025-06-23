
import { useState, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  // Memoized auth state handler to prevent unnecessary re-renders
  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    console.log('useAuthUser: Auth state change:', event, session?.user?.id);
    
    try {
      setError(null);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id ?? null);
      setUserName(session?.user?.email ?? null);
      
      // For now, set basic roles - you can expand this later
      setIsAdmin(false);
      setIsOwner(false);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error in auth state change handler:', err);
      setError('Authentication error occurred');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('useAuthUser: Setting up auth state listener...');
    
    let isMounted = true;
    
    // Set up auth state listener with cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session with abort controller
    const initializeAuth = async () => {
      try {
        console.log('useAuthUser: Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return; // Prevent state updates if component unmounted
        
        if (error) {
          console.error('useAuthUser: Error getting session:', error);
          setError('Failed to get session');
        } else {
          console.log('useAuthUser: Initial session check:', session?.user?.id);
          // The onAuthStateChange will handle setting the state
        }
      } catch (error) {
        if (isMounted) {
          console.error('useAuthUser: Error in initial auth check:', error);
          setError('Authentication initialization failed');
        }
      } finally {
        // Only set loading to false if we don't have a session
        // If we have a session, onAuthStateChange will handle it
        if (isMounted) {
          setTimeout(() => {
            setIsLoading(false);
          }, 1000); // Give some time for the auth state change event
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('useAuthUser: Cleaning up auth listener');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const refetchRoles = useCallback(() => Promise.resolve(), []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    isOwner,
    userId,
    userName,
    error,
    refetchRoles,
  };
}
