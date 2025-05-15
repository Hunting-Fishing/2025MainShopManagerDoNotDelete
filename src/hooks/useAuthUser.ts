
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
  user?: any; // Adding user property for backward compatibility if needed
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
          console.log("Authenticated user:", session.user.id, session.user.email);
          
          // Fetch user profile to get name
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, department, job_title, shop_id')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && !profileError) {
            const fullName = [profileData.first_name, profileData.last_name]
              .filter(Boolean)
              .join(' ');
            setUserName(fullName || session.user.email?.split('@')[0] || 'User');
            console.log("User profile data:", profileData);
            console.log("User shop_id:", profileData.shop_id);
            
            // If profile has a shop_id, fetch the shop details
            if (profileData.shop_id) {
              const { data: shopData, error: shopError } = await supabase
                .from('shops')
                .select('*')
                .eq('id', profileData.shop_id)
                .single();
                
              if (shopData && !shopError) {
                console.log("User's shop details:", shopData);
              } else {
                console.error("Error fetching shop details:", shopError);
              }
            } else {
              console.log("User profile does not have a shop_id");
            }
          } else {
            // Fallback name if profile not found
            setUserName(session.user.email?.split('@')[0] || 'User');
            console.error("Error fetching profile data:", profileError);
          }
          
          // Check if user has admin role - using the proper table join
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('roles:role_id(name)')
            .eq('user_id', session.user.id);
            
          if (roleData && roleData.length > 0 && !roleError) {
            console.log("User roles:", roleData);
            const hasAdminRole = roleData.some(
              (role) => role.roles && 
              typeof role.roles === 'object' &&
              'name' in role.roles &&
              (role.roles.name === 'admin' || role.roles.name === 'owner')
            );
            setIsAdmin(hasAdminRole);
          } else {
            console.log("No roles found or error:", roleError);
          }
          
        } else {
          // No session found
          console.log("No authenticated session found");
          setUserId(null);
          setUserEmail(null);
          setUserName(null);
          setIsAdmin(false);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event);
            if (event === 'SIGNED_IN' && newSession) {
              setUserId(newSession.user.id);
              setUserEmail(newSession.user.email);
              
              // Fetch user profile for name on sign in
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name, department, job_title, shop_id')
                .eq('id', newSession.user.id)
                .single();
                
              if (profileData) {
                const fullName = [profileData.first_name, profileData.last_name]
                  .filter(Boolean)
                  .join(' ');
                setUserName(fullName || newSession.user.email?.split('@')[0] || 'User');
                console.log("User signed in, profile data:", profileData);
              } else {
                setUserName(newSession.user.email?.split('@')[0] || 'User');
              }
              
              // Check admin status on sign in - using the proper table join
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('roles:role_id(name)')
                .eq('user_id', newSession.user.id);
                
              if (roleData && roleData.length > 0) {
                const hasAdminRole = roleData.some(
                  (role) => role.roles && 
                  typeof role.roles === 'object' &&
                  'name' in role.roles &&
                  (role.roles.name === 'admin' || role.roles.name === 'owner')
                );
                setIsAdmin(hasAdminRole);
              }
              
            } else if (event === 'SIGNED_OUT') {
              console.log("User signed out");
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
    error,
    user: userId ? { id: userId, email: userEmail, name: userName } : null // For backward compatibility
  };
}
