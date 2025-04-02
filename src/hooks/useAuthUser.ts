
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAuthUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to login if no session
          setIsLoading(false);
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }
        
        setIsAuthenticated(true);
        setUserId(session.user.id);
        
        // Get user's name from metadata or use email as fallback
        const userMeta = session.user.user_metadata;
        const displayName = userMeta?.full_name || 
                          (userMeta?.first_name && userMeta?.last_name 
                            ? `${userMeta.first_name} ${userMeta.last_name}` 
                            : session.user.email);
        
        setUserName(displayName || 'User');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to get user:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate",
          variant: "destructive",
        });
        setIsLoading(false);
        setIsAuthenticated(false);
        navigate('/login');
      }
    };
    
    fetchUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserId(null);
          setUserName('');
          navigate('/login');
        } else if (session?.user) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          const userMeta = session.user.user_metadata;
          const displayName = userMeta?.full_name || 
                            (userMeta?.first_name && userMeta?.last_name 
                              ? `${userMeta.first_name} ${userMeta.last_name}` 
                              : session.user.email);
          
          setUserName(displayName || 'User');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { userId, userName, isLoading, isAuthenticated };
}
