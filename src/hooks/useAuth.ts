
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);
        
        try {
          setError(null);
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          
          if (session?.user) {
            // Fetch user role
            setTimeout(async () => {
              try {
                const { data: roleData } = await supabase
                  .from('user_roles')
                  .select('roles(name)')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (mounted && roleData?.roles) {
                  setUserRole(roleData.roles.name);
                }
              } catch (err) {
                console.warn('Could not fetch user role:', err);
                if (mounted) {
                  setUserRole('user'); // Default role
                }
              }
            }, 0);
          } else {
            setUserRole(null);
          }
        } catch (err) {
          console.error('Error in auth state change handler:', err);
          if (mounted) {
            setError('Authentication error occurred');
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setError('Failed to get session');
          }
        }
        // Session will be handled by the auth state change listener above
      } catch (error) {
        console.error('Error in initial session check:', error);
        if (mounted) {
          setError('Authentication initialization failed');
        }
      } finally {
        if (mounted && !session) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    isAuthenticated,
    userRole,
    error,
    signOut,
    // Legacy compatibility
    isLoading: loading,
    isAdmin: userRole === 'admin' || userRole === 'owner',
    isOwner: userRole === 'owner',
    userId: user?.id || null,
    userName: user?.email || user?.user_metadata?.full_name || null,
    refetchRoles: () => Promise.resolve(), // Placeholder for compatibility
  };
};
