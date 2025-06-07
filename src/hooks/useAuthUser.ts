
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { cleanupAuthState } from '@/utils/authCleanup';

export function useAuthUser() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  
  const { isImpersonating, impersonatedCustomer } = useImpersonation();

  useEffect(() => {
    let isMounted = true;
    
    // If user is impersonating, we'll consider them authenticated and set user information from impersonated customer
    if (isImpersonating && impersonatedCustomer) {
      if (isMounted) {
        setIsAuthenticated(true);
        setUserId(impersonatedCustomer.id);
        setUserName(impersonatedCustomer.name || impersonatedCustomer.email);
        setIsAdmin(false);
        setIsOwner(false);
        setRoleCheckComplete(true);
        setIsLoading(false);
      }
      return;
    }
    
    async function initializeAuth() {
      try {
        console.log('Initializing authentication...');
        
        // Set up auth state listener FIRST to avoid missing events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change event:', event, session?.user?.id);
            
            if (!isMounted) return;
            
            // Handle auth events
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              if (event === 'SIGNED_OUT') {
                resetAuthState();
                return;
              }
            }
            
            // Update session and auth state synchronously
            setSession(session);
            const isAuth = !!session?.user;
            setIsAuthenticated(isAuth);
            setUserId(session?.user?.id || null);
            setUser(session?.user || null);
            
            if (session?.user) {
              // Set user name from user metadata or email
              const metadata = session.user.user_metadata;
              const fullName = metadata?.full_name || 
                             metadata?.name || 
                             `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim() || 
                             session.user.email || '';
              setUserName(fullName);
              
              // Defer role checking to prevent auth deadlocks
              setTimeout(() => {
                if (isMounted) {
                  checkUserRoles(session.user.id);
                }
              }, 100);
            } else {
              setUserName('');
              setIsAdmin(false);
              setIsOwner(false);
              setRoleCheckComplete(true);
            }
          }
        );
        
        // THEN check for existing session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          // If there's an error getting session, clean up and reset
          cleanupAuthState();
          resetAuthState();
          return () => subscription.unsubscribe();
        }
        
        if (isMounted) {
          const currentSession = sessionData.session;
          const isAuth = !!currentSession?.user;
          
          console.log('Initial session check:', { isAuth, userId: currentSession?.user?.id });
          
          setSession(currentSession);
          setIsAuthenticated(isAuth);
          setUserId(currentSession?.user?.id || null);
          setUser(currentSession?.user || null);
          
          if (currentSession?.user) {
            const metadata = currentSession.user.user_metadata;
            const fullName = metadata?.full_name || 
                           metadata?.name || 
                           `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim() || 
                           currentSession.user.email || '';
            setUserName(fullName);
            
            // Check user roles
            await checkUserRoles(currentSession.user.id);
          } else {
            setRoleCheckComplete(true);
          }
        }
        
        return () => {
          isMounted = false;
          subscription.unsubscribe();
        };
        
      } catch (err) {
        console.error("Unexpected error during auth initialization:", err);
        if (isMounted) {
          resetAuthState();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    async function checkUserRoles(userId: string) {
      if (!isMounted) return;
      
      try {
        console.log('Checking user roles for:', userId);
        
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            roles:role_id(
              id,
              name
            )
          `)
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching user roles:', error);
          if (isMounted) {
            setRoleCheckComplete(true);
          }
          return;
        }

        if (isMounted) {
          if (userRoles && userRoles.length > 0) {
            const roles = userRoles.map(ur => {
              const role = ur.roles as any;
              return role?.name;
            }).filter(Boolean);

            console.log('User roles from database:', roles);
            
            const hasAdmin = roles.includes('admin');
            const hasOwner = roles.includes('owner');
            
            setIsAdmin(hasAdmin);
            setIsOwner(hasOwner);
            
            console.log('Role check complete:', { hasAdmin, hasOwner });
          } else {
            console.log('No roles found for user');
            setIsAdmin(false);
            setIsOwner(false);
          }
          setRoleCheckComplete(true);
        }
      } catch (err) {
        console.error('Error checking user roles:', err);
        if (isMounted) {
          setIsAdmin(false);
          setIsOwner(false);
          setRoleCheckComplete(true);
        }
      }
    }

    function resetAuthState() {
      if (!isMounted) return;
      
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);
      setSession(null);
      setUserName('');
      setIsAdmin(false);
      setIsOwner(false);
      setRoleCheckComplete(true);
      setIsLoading(false);
    }
    
    initializeAuth();
  }, [isImpersonating, impersonatedCustomer]);

  // Return loading state until both auth and roles are checked
  const finalLoading = isLoading || (isAuthenticated && !roleCheckComplete);

  return {
    isLoading: finalLoading,
    isAuthenticated,
    userId,
    user,
    session,
    userName,
    isAdmin,
    isOwner
  };
}
