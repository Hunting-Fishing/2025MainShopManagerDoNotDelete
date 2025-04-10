
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define the return type for our hook
interface UseAuthUserResult {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
}

export function useAuthUser(): UseAuthUserResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUserSession() {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          return;
        }
        
        if (session) {
          setUserId(session.user.id);
          setUserEmail(session.user.email);
          
          // Fetch user profile to get name
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && !profileError) {
            const fullName = [profileData.first_name, profileData.last_name]
              .filter(Boolean)
              .join(' ');
            setUserName(fullName || session.user.email?.split('@')[0] || 'User');
          } else {
            // Fallback name if profile not found
            setUserName(session.user.email?.split('@')[0] || 'User');
          }
          
          // Check if user has admin role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('roles:role_id(name)')
            .eq('user_id', session.user.id);
            
          if (roleData && roleData.length > 0) {
            const hasAdminRole = roleData.some(
              (role) => role.roles?.name === 'admin' || role.roles?.name === 'owner'
            );
            setIsAdmin(hasAdminRole);
          }
          
        } else {
          // No session found
          setUserId(null);
          setUserEmail(null);
          setUserName(null);
          setIsAdmin(false);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession) {
              setUserId(newSession.user.id);
              setUserEmail(newSession.user.email);
              
              // Fetch user profile for name on sign in
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', newSession.user.id)
                .single();
                
              if (profileData) {
                const fullName = [profileData.first_name, profileData.last_name]
                  .filter(Boolean)
                  .join(' ');
                setUserName(fullName || newSession.user.email?.split('@')[0] || 'User');
              } else {
                setUserName(newSession.user.email?.split('@')[0] || 'User');
              }
              
              // Check admin status on sign in
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('roles:role_id(name)')
                .eq('user_id', newSession.user.id);
                
              if (roleData && roleData.length > 0) {
                const hasAdminRole = roleData.some(
                  (role) => role.roles?.name === 'admin' || role.roles?.name === 'owner'
                );
                setIsAdmin(hasAdminRole);
              }
              
            } else if (event === 'SIGNED_OUT') {
              setUserId(null);
              setUserEmail(null);
              setUserName(null);
              setIsAdmin(false);
            }
          }
        );
        
        // Clean up subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error getting auth session:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    getUserSession();
  }, []);

  return {
    userId,
    userEmail,
    userName,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    isAuthenticated: !!userId,
    isAdmin,
    error
  };
}
