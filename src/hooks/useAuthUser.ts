
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useImpersonation } from '@/contexts/ImpersonationContext';

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
    // If user is impersonating, we'll consider them authenticated and set user information from impersonated customer
    if (isImpersonating && impersonatedCustomer) {
      setIsAuthenticated(true);
      setUserId(impersonatedCustomer.id);
      setUserName(impersonatedCustomer.name || impersonatedCustomer.email);
      setIsAdmin(false);
      setIsOwner(false);
      setRoleCheckComplete(true);
      setIsLoading(false);
      return;
    }
    
    async function checkAuthStatus() {
      try {
        console.log('Checking auth status...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          resetAuthState();
          return;
        }
        
        const isAuth = !!data.session?.user;
        console.log('Auth status check:', { isAuth, userId: data.session?.user?.id });
        
        setSession(data.session);
        setIsAuthenticated(isAuth);
        setUserId(data.session?.user?.id || null);
        setUser(data.session?.user || null);
        
        // Set user name from user metadata or email
        if (data.session?.user) {
          const metadata = data.session.user.user_metadata;
          setUserName(
            metadata?.full_name || 
            metadata?.name || 
            `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim() || 
            data.session.user.email || 
            ''
          );
          
          // Check user roles from the database
          await checkUserRoles(data.session.user.id);
        } else {
          setRoleCheckComplete(true);
        }
      } catch (err) {
        console.error("Unexpected error checking auth:", err);
        resetAuthState();
      } finally {
        setIsLoading(false);
      }
    }

    async function checkUserRoles(userId: string) {
      try {
        console.log('Checking user roles for:', userId);
        
        // Check if user has admin or owner role
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
          setRoleCheckComplete(true);
          return;
        }

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
      } catch (err) {
        console.error('Error checking user roles:', err);
        setIsAdmin(false);
        setIsOwner(false);
      } finally {
        setRoleCheckComplete(true);
      }
    }

    function resetAuthState() {
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);
      setUserName('');
      setIsAdmin(false);
      setIsOwner(false);
      setRoleCheckComplete(true);
      setIsLoading(false);
    }
    
    checkAuthStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setIsAuthenticated(!!session?.user);
        setUserId(session?.user?.id || null);
        setUser(session?.user || null);
        setSession(session);
        setRoleCheckComplete(false);
        
        // Update user name and roles on auth state change
        if (session?.user) {
          const metadata = session.user.user_metadata;
          setUserName(
            metadata?.full_name || 
            metadata?.name || 
            `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim() || 
            session.user.email || 
            ''
          );
          
          // Defer role checking to prevent potential auth deadlocks
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 100);
        } else {
          setUserName('');
          setIsAdmin(false);
          setIsOwner(false);
          setRoleCheckComplete(true);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
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
