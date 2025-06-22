
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
  const [error, setError] = useState<string | null>(null);

  const checkUserRole = async (userId: string) => {
    try {
      console.log('Checking user role for:', userId);
      
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles:role_id(
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error fetching user roles:', roleError);
        return;
      }

      console.log('User roles data:', userRoles);

      if (userRoles && userRoles.length > 0) {
        const roles = userRoles.map(ur => ur.roles?.name).filter(Boolean);
        console.log('User roles:', roles);
        
        setIsOwner(roles.includes('owner'));
        setIsAdmin(roles.includes('admin') || roles.includes('owner'));
      } else {
        console.log('No roles found for user');
        setIsOwner(false);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Exception checking user role:', err);
      setError('Failed to check user permissions');
    }
  };

  useEffect(() => {
    console.log('useAuthUser: Setting up auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuthUser: Auth state change:', event, session?.user?.id);
        
        try {
          setError(null);
          
          // Update session and user state immediately
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          setUserId(session?.user?.id ?? null);
          setUserName(session?.user?.email ?? null);
          
          // Check roles if user is authenticated
          if (session?.user?.id) {
            await checkUserRole(session.user.id);
          } else {
            setIsAdmin(false);
            setIsOwner(false);
          }
        } catch (err) {
          console.error('Error in auth state change handler:', err);
          setError('Authentication error occurred');
        } finally {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('useAuthUser: Error getting session:', error);
          setError('Failed to get session');
        } else {
          console.log('useAuthUser: Initial session check:', session?.user?.id);
          
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          setUserId(session?.user?.id ?? null);
          setUserName(session?.user?.email ?? null);
          
          if (session?.user?.id) {
            await checkUserRole(session.user.id);
          }
        }
      } catch (error) {
        console.error('useAuthUser: Error in initial auth check:', error);
        setError('Authentication initialization failed');
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
    error,
    refetchRoles: () => userId ? checkUserRole(userId) : Promise.resolve(),
  };
}
