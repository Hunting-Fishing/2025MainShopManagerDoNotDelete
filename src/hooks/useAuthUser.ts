
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSessionRecovery } from './useSessionRecovery';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { attemptSessionRecovery, isRecoveryInProgress } = useSessionRecovery();

  // Function to fetch user roles from database with recovery support
  const fetchUserRoles = useCallback(async (authUserId: string, retryWithRecovery = true): Promise<void> => {
    setIsRolesLoading(true);
    try {
      console.log('🔍 Fetching user roles for auth.uid():', authUserId);
      
      // First try direct auth.uid() lookup (newer pattern)
      const { data: directRoles, error: directError } = await supabase
        .from('user_roles')
        .select(`roles (name)`)
        .eq('user_id', authUserId);

      if (!directError && directRoles && directRoles.length > 0) {
        const roleNames = directRoles.map(item => (item.roles as any)?.name).filter(Boolean) as string[];
        console.log('✅ User roles fetched via auth.uid():', roleNames);
        
        setUserRoles(roleNames);
        setIsAdmin(roleNames.includes('admin'));
        setIsOwner(roleNames.includes('owner'));
        setIsManager(roleNames.includes('manager') || roleNames.includes('yard_manager'));
        setError(null);
        return;
      }

      // If no roles found directly, try via profile.id (older pattern)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .or(`user_id.eq.${authUserId},id.eq.${authUserId}`)
        .maybeSingle();

      const profileId = profileData?.id;
      
      if (profileId && profileId !== authUserId) {
        console.log('🔍 Trying profile.id lookup:', profileId);
        
        const { data: profileRoles, error: profileError } = await supabase
          .from('user_roles')
          .select(`roles (name)`)
          .eq('user_id', profileId);

        if (!profileError && profileRoles && profileRoles.length > 0) {
          const roleNames = profileRoles.map(item => (item.roles as any)?.name).filter(Boolean) as string[];
          console.log('✅ User roles fetched via profile.id:', roleNames);
          
          setUserRoles(roleNames);
          setIsAdmin(roleNames.includes('admin'));
          setIsOwner(roleNames.includes('owner'));
          setIsManager(roleNames.includes('manager') || roleNames.includes('yard_manager'));
          setError(null);
          return;
        }

        if (profileError) {
          if (retryWithRecovery && profileError.message?.toLowerCase().includes('jwt') && !isRecoveryInProgress()) {
            console.log('🔄 JWT error detected, attempting session recovery...');
            const recoveryResult = await attemptSessionRecovery({ maxRetries: 2 });
            
            if (recoveryResult.success) {
              console.log('✅ Session recovered, retrying role fetch...');
              return fetchUserRoles(authUserId, false);
            }
          }
        }
      }

      // No roles found via either pattern
      console.warn('⚠️ No roles found for user:', authUserId);
      setUserRoles([]);
      setIsAdmin(false);
      setIsOwner(false);
      setIsManager(false);
      
    } catch (err) {
      console.error('❌ Error in fetchUserRoles:', err);
      setUserRoles([]);
      setIsAdmin(false);
      setIsOwner(false);
      setIsManager(false);
      setError('Failed to load user permissions');
    } finally {
      setIsRolesLoading(false);
    }
  }, [attemptSessionRecovery, isRecoveryInProgress]);

  // Memoized auth state handler to prevent unnecessary re-renders
  const handleAuthStateChange = useCallback((event: string, currentSession: Session | null) => {
    console.log('useAuthUser: Auth state change:', event, currentSession?.user?.id);
    
    try {
      setError(null);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);
      setUserId(currentSession?.user?.id ?? null);
      setUserName(currentSession?.user?.email ?? currentSession?.user?.user_metadata?.full_name ?? null);
      
      // Fetch real user roles from database
      if (currentSession?.user?.id) {
        // Fetch roles - isLoading stays true until roles are fetched
        fetchUserRoles(currentSession.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsAdmin(false);
        setIsOwner(false);
        setIsManager(false);
        setUserRoles([]);
        setIsLoading(false);
      }
      
    } catch (err) {
      console.error('Error in auth state change handler:', err);
      setError('Authentication error occurred');
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setUserId(null);
      setUserName(null);
      setIsLoading(false);
    }
  }, [fetchUserRoles]);

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
    isRolesLoading,
    isAuthenticated,
    isAdmin,
    isOwner,
    isManager,
    userRoles,
    userId,
    userName,
    error,
    refetchRoles,
  };
}
