
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAuthUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Redirect to login if no user
          toast({
            title: "Authentication required",
            description: "Please sign in to use the chat feature",
            variant: "destructive",
          });
          
          navigate('/');
          return;
        }
        
        setUserId(user.id);
        
        // Get user's name from metadata or use email as fallback
        const userMeta = user.user_metadata;
        const displayName = userMeta?.full_name || 
                           (userMeta?.first_name && userMeta?.last_name 
                             ? `${userMeta.first_name} ${userMeta.last_name}` 
                             : user.email);
        
        setUserName(displayName || 'User');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to get user:', error);
        toast({
          title: "Error",
          description: "Failed to authenticate",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    
    fetchUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/');
        } else if (session?.user) {
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

  return { userId, userName, isLoading };
}
