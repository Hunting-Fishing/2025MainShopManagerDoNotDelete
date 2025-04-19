
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useProfileStore } from "@/stores/profileStore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    // Get initial auth state
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // If user is logged in, fetch their profile
        if (user) {
          fetchProfile(user.id);
        }
      } catch (error) {
        console.error("Error getting initial user:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
    
    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
}
