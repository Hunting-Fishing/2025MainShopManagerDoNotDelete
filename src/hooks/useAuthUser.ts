
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuthUser() {
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          
          // Get user's name from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            setUserName(fullName || 'User');
          }
          
          // Check if user is admin by querying user_roles
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
              role_id,
              roles:role_id(name)
            `)
            .eq('user_id', session.user.id);
            
          // Set isAdmin to true if any of the user's roles is 'admin' or 'owner'
          const isUserAdmin = userRoles?.some(
            role => role.roles?.name === 'admin' || role.roles?.name === 'owner'
          ) || false;
          
          console.log('User roles:', userRoles);
          console.log('Is admin:', isUserAdmin);
          
          setIsAdmin(isUserAdmin);
        } else {
          setIsAuthenticated(false);
          setUserName('');
          setUserId(undefined);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        setUserId(session?.user.id);
        
        if (session) {
          // Get user's name from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            setUserName(fullName || 'User');
          }
          
          // Check if user is admin
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
              role_id,
              roles:role_id(name)
            `)
            .eq('user_id', session.user.id);
            
          // Set isAdmin to true if any of the user's roles is 'admin' or 'owner'
          const isUserAdmin = userRoles?.some(
            role => role.roles?.name === 'admin' || role.roles?.name === 'owner'
          ) || false;
          
          setIsAdmin(isUserAdmin);
        } else {
          setUserName('');
          setIsAdmin(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { 
    userName, 
    userId, 
    isAuthenticated, 
    isLoading,
    isAdmin 
  };
}
