
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: any | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  signIn: async () => ({}),
  signOut: async () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    const getSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (!error && data.session) {
        setUser(data.session.user);
        
        // Get user role from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData) {
          setUserRole(profileData.role);
        } else {
          // Default role if no profile found
          setUserRole('guest');
        }
      } else {
        setUser(null);
        setUserRole('guest');
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Get role when auth state changes
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            setUserRole(profileData.role);
          }
        } else {
          setUser(null);
          setUserRole('guest');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('guest');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
