
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
  
  const { isImpersonating, impersonatedCustomer } = useImpersonation();

  useEffect(() => {
    // If user is impersonating, we'll consider them authenticated and set user information from impersonated customer
    if (isImpersonating && impersonatedCustomer) {
      setIsAuthenticated(true);
      setUserId(impersonatedCustomer.id);
      setUserName(impersonatedCustomer.name || impersonatedCustomer.email);
      setIsAdmin(false);
      setIsOwner(false);
      setIsLoading(false);
      return;
    }
    
    async function checkAuthStatus() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          setIsAuthenticated(false);
          setUserId(null);
          setUser(null);
          setUserName('');
          setIsAdmin(false);
          setIsOwner(false);
          setIsLoading(false);
          return;
        }
        
        const isAuth = !!data.session?.user;
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
          
          // Check user roles from the database instead of metadata
          if (data.session.user.id) {
            await checkUserRoles(data.session.user.id);
          }
        }
      } catch (err) {
        console.error("Unexpected error checking auth:", err);
        setIsAuthenticated(false);
        setUserId(null);
        setUser(null);
        setUserName('');
        setIsAdmin(false);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    }

    async function checkUserRoles(userId: string) {
      try {
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
          return;
        }

        if (userRoles && userRoles.length > 0) {
          const roles = userRoles.map(ur => {
            const role = ur.roles as any;
            return role?.name;
          }).filter(Boolean);

          console.log('User roles from database:', roles);
          
          setIsAdmin(roles.includes('admin'));
          setIsOwner(roles.includes('owner'));
        } else {
          console.log('No roles found for user');
          setIsAdmin(false);
          setIsOwner(false);
        }
      } catch (err) {
        console.error('Error checking user roles:', err);
        setIsAdmin(false);
        setIsOwner(false);
      }
    }
    
    checkAuthStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session?.user);
        setUserId(session?.user?.id || null);
        setUser(session?.user || null);
        setSession(session);
        
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
          
          // Check user roles from database
          await checkUserRoles(session.user.id);
        } else {
          setUserName('');
          setIsAdmin(false);
          setIsOwner(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isImpersonating, impersonatedCustomer]);

  return {
    isLoading,
    isAuthenticated,
    userId,
    user,
    session,
    userName,
    isAdmin,
    isOwner
  };
}
