
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSessionRecovery } from './useSessionRecovery';

const AUTH_TIMEOUT_MS = 8000; // 8 second hard timeout

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleAuthStateChangeRef = useRef<(event: string, currentSession: Session | null) => void>();

  // Function to fetch user roles from database with recovery support
  const fetchUserRoles = async (authUserId: string, retryWithRecovery = true): Promise<void> => {
    setIsRolesLoading(true);
    try {
      console.log('🔍 Fetching user roles for auth.uid():', authUserId);
      
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
  };

  // Keep the ref updated with latest handler (avoids stale closures)
  handleAuthStateChangeRef.current = (event: string, currentSession: Session | null) => {
    console.log('useAuthUser: Auth state change:', event, currentSession?.user?.id);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      setError(null);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);
      setUserId(currentSession?.user?.id ?? null);
      setUserName(currentSession?.user?.email ?? currentSession?.user?.user_metadata?.full_name ?? null);
      
      if (currentSession?.user?.id) {
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
  };

  useEffect(() => {
    let isMounted = true;
    
    // Hard timeout
    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Auth bootstrap timeout after', AUTH_TIMEOUT_MS, 'ms');
        setIsLoading(false);
        setError('Authentication took too long. Please refresh or try logging in again.');
      }
    }, AUTH_TIMEOUT_MS);
    
    // Stable wrapper that delegates to the ref
    const stableHandler = (event: string, currentSession: Session | null) => {
      if (isMounted) {
        handleAuthStateChangeRef.current?.(event, currentSession);
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(stableHandler);

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('useAuthUser: Error getting session:', error);
        setError('Failed to get session');
        setIsLoading(false);
      } else {
        stableHandler('INITIAL_SESSION', session);
      }
    }).catch((err) => {
      if (isMounted) {
        console.error('useAuthUser: Error in initial auth check:', err);
        setError('Authentication initialization failed');
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, []); // stable — no deps needed, handler accessed via ref

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
