
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
      async (event, session) => {
        console.log('useAuthUser: Auth state change:', event, session?.user?.id);
        
        // Update session and user state immediately
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setUserId(session?.user?.id ?? null);
        setUserName(session?.user?.email ?? null);
        
        // Defer role checking to avoid potential deadlocks
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsOwner(false);
        }
        
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
          
          if (session?.user) {
            await checkUserRoles(session.user.id);
          }
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

  const checkUserRoles = async (userId: string) => {
    try {
      console.log('useAuthUser: Checking roles for user:', userId);
      
      // Check if user has admin or owner role
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles:role_id(name)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('useAuthUser: Error checking user roles:', error);
        return;
      }

      const roleNames = userRoles?.map(ur => (ur.roles as any)?.name) || [];
      console.log('useAuthUser: User roles:', roleNames);
      
      setIsAdmin(roleNames.includes('admin') || roleNames.includes('administrator'));
      setIsOwner(roleNames.includes('owner'));
    } catch (error) {
      console.error('useAuthUser: Error in role check:', error);
    }
  };

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
