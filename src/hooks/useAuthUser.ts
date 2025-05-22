
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export function useAuthUser() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const { isImpersonating } = useImpersonation();

  useEffect(() => {
    // If user is impersonating, we'll consider them authenticated
    if (isImpersonating) {
      setIsAuthenticated(true);
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
          setIsLoading(false);
          return;
        }
        
        const isAuth = !!data.session?.user;
        setSession(data.session);
        setIsAuthenticated(isAuth);
        setUserId(data.session?.user?.id || null);
        setUser(data.session?.user || null);
      } catch (err) {
        console.error("Unexpected error checking auth:", err);
        setIsAuthenticated(false);
        setUserId(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session?.user);
        setUserId(session?.user?.id || null);
        setUser(session?.user || null);
        setSession(session);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isImpersonating]);

  return {
    isLoading,
    isAuthenticated,
    userId,
    user,
    session,
  };
}
