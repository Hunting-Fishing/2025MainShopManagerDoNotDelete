
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setUser(null);
          return;
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // Mock data if no profile exists
        const userData: User = profile ? {
          id: session.user.id,
          email: session.user.email || '',
          role: 'admin', // Default role - in real app this would come from profile
          firstName: profile.first_name,
          lastName: profile.last_name
        } : {
          id: session.user.id,
          email: session.user.email || '',
          role: 'admin'
        };
        
        setUser(userData);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          fetchUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // For this demo, mock a user if none exists
  useEffect(() => {
    if (!isLoading && !user && !error) {
      // Mock user data
      setUser({
        id: 'mock-user-id',
        email: 'demo@example.com',
        role: 'admin',
        firstName: 'Demo',
        lastName: 'User'
      });
    }
  }, [isLoading, user, error]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
