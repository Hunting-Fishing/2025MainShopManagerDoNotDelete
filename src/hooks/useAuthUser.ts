
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the return type for our hook
interface UseAuthUserResult {
  userId: string | null;
  userEmail: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuthUser(): UseAuthUserResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
        } else {
          // No session found
          setUserId(null);
          setUserEmail(null);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession) {
              setUserId(newSession.user.id);
              setUserEmail(newSession.user.email);
            } else if (event === 'SIGNED_OUT') {
              setUserId(null);
              setUserEmail(null);
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
    isLoading,
    isAuthenticated: !!userId,
    error
  };
}
