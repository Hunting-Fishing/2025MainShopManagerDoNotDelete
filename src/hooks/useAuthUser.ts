
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSessionRecovery } from './useSessionRecovery';

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
  
  const { attemptSessionRecovery, isRecoveryInProgress } = useSessionRecovery();

  // Memoized auth state handler to prevent unnecessary re-renders
  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    console.log('useAuthUser: Auth state change:', event, session?.user?.id);
    
    try {
      setError(null);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id ?? null);
      setUserName(session?.user?.email ?? session?.user?.user_metadata?.full_name ?? null);
      
      // Fetch real user roles from database
      if (session?.user?.id) {
        // Use setTimeout to prevent potential deadlocks with auth state changes
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsOwner(false);
      }
      
    } catch (err) {
      console.error('Error in auth state change handler:', err);
      setError('Authentication error occurred');
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setUserId(null);
      setUserName(null);
    } finally {
      // Always set loading to false after handling auth state change
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('useAuthUser: Setting up auth state listener...');
    
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    // Set up auth state listener with cleanup
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
      authSubscription = subscription;
    } catch (err) {
      console.error('useAuthUser: Error setting up auth listener:', err);
      if (isMounted) {
        setError('Failed to initialize authentication');
        setIsLoading(false);
      }
      return;
    }

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('useAuthUser: Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('useAuthUser: Error getting session:', error);
          setError('Failed to get session');
          setIsLoading(false);
        } else {
          console.log('useAuthUser: Initial session check:', session?.user?.id);
          // Manually trigger the auth state handler for initial session
          handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        if (isMounted) {
          console.error('useAuthUser: Error in initial auth check:', error);
          setError('Authentication initialization failed');
          setIsLoading(false);
        }
      }
    };

    // Add small delay to prevent race conditions
    const timer = setTimeout(() => {
      if (isMounted) {
        initializeAuth();
      }
    }, 50);

    // Cleanup function
    return () => {
      console.log('useAuthUser: Cleaning up auth listener');
      isMounted = false;
      clearTimeout(timer);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [handleAuthStateChange]);

  // Function to fetch user roles from database with recovery support
  const fetchUserRoles = useCallback(async (userId: string, retryWithRecovery = true) => {
    try {
      console.log('🔍 Fetching user roles for userId:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching user roles:', error);
        
        // If it's an auth error and we haven't tried recovery yet, attempt recovery
        if (retryWithRecovery && error.message?.toLowerCase().includes('jwt') && !isRecoveryInProgress()) {
          console.log('🔄 JWT error detected, attempting session recovery...');
          const recoveryResult = await attemptSessionRecovery({ maxRetries: 2 });
          
          if (recoveryResult.success) {
            console.log('✅ Session recovered, retrying role fetch...');
            // Retry without recovery to prevent infinite loops
            return fetchUserRoles(userId, false);
          }
        }
        
        setIsAdmin(false);
        setIsOwner(false);
        setError('Failed to load user permissions');
        return;
      }

      const roleNames = data?.map(item => (item.roles as any)?.name).filter(Boolean) as string[] || [];
      console.log('✅ User roles fetched successfully:', roleNames);
      
      setIsAdmin(roleNames.includes('admin'));
      setIsOwner(roleNames.includes('owner'));
      setError(null); // Clear any previous errors
      
    } catch (err) {
      console.error('❌ Error in fetchUserRoles:', err);
      setIsAdmin(false);
      setIsOwner(false);
      setError('Failed to load user permissions');
    }
  }, [attemptSessionRecovery, isRecoveryInProgress]);

  const refetchRoles = useCallback(() => {
    if (userId) {
      return fetchUserRoles(userId);
    }
    return Promise.resolve();
  }, [userId, fetchUserRoles]);

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
