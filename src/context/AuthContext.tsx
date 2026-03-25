import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const AUTH_TIMEOUT_MS = 8000;

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isRolesLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isManager: boolean;
  userRoles: string[];
  userId: string | null;
  userName: string | null;
  error: string | null;
  refetchRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlerRef = useRef<(event: string, currentSession: Session | null) => void>();

  const fetchUserRoles = async (authUserId: string): Promise<void> => {
    setIsRolesLoading(true);
    try {
      const { data: directRoles, error: directError } = await supabase
        .from('user_roles')
        .select(`roles (name)`)
        .eq('user_id', authUserId);

      if (!directError && directRoles && directRoles.length > 0) {
        const roleNames = directRoles.map(item => (item.roles as any)?.name).filter(Boolean) as string[];
        setUserRoles(roleNames);
        setIsAdmin(roleNames.includes('admin'));
        setIsOwner(roleNames.includes('owner'));
        setIsManager(roleNames.includes('manager') || roleNames.includes('yard_manager'));
        setError(null);
        return;
      }

      // Fallback: try profile.id lookup
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .or(`user_id.eq.${authUserId},id.eq.${authUserId}`)
        .maybeSingle();

      const profileId = profileData?.id;
      if (profileId && profileId !== authUserId) {
        const { data: profileRoles, error: profileError } = await supabase
          .from('user_roles')
          .select(`roles (name)`)
          .eq('user_id', profileId);

        if (!profileError && profileRoles && profileRoles.length > 0) {
          const roleNames = profileRoles.map(item => (item.roles as any)?.name).filter(Boolean) as string[];
          setUserRoles(roleNames);
          setIsAdmin(roleNames.includes('admin'));
          setIsOwner(roleNames.includes('owner'));
          setIsManager(roleNames.includes('manager') || roleNames.includes('yard_manager'));
          setError(null);
          return;
        }
      }

      setUserRoles([]);
      setIsAdmin(false);
      setIsOwner(false);
      setIsManager(false);
    } catch (err) {
      console.error('AuthProvider: Error fetching roles:', err);
      setUserRoles([]);
      setIsAdmin(false);
      setIsOwner(false);
      setIsManager(false);
      setError('Failed to load user permissions');
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Keep handler in ref to avoid stale closures
  handlerRef.current = (event: string, currentSession: Session | null) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

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
  };

  useEffect(() => {
    let isMounted = true;

    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Auth bootstrap timeout after', AUTH_TIMEOUT_MS, 'ms');
        setIsLoading(false);
        setError('Authentication took too long. Please refresh or try logging in again.');
      }
    }, AUTH_TIMEOUT_MS);

    const stableHandler = (event: string, currentSession: Session | null) => {
      if (isMounted) {
        handlerRef.current?.(event, currentSession);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(stableHandler);

    supabase.auth.getSession().then(({ data: { session: s }, error: e }) => {
      if (!isMounted) return;
      if (e) {
        console.error('AuthProvider: Error getting session:', e);
        setError('Failed to get session');
        setIsLoading(false);
      } else {
        stableHandler('INITIAL_SESSION', s);
      }
    }).catch((err) => {
      if (isMounted) {
        console.error('AuthProvider: Error in initial auth check:', err);
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
  }, []);

  const refetchRoles = useCallback(async () => {
    if (userId) {
      await fetchUserRoles(userId);
    }
  }, [userId]);

  const value: AuthState = {
    user, session, isLoading, isRolesLoading, isAuthenticated,
    isAdmin, isOwner, isManager, userRoles, userId, userName,
    error, refetchRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
