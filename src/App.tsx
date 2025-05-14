
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import './App.css';
import { supabase } from '@/lib/supabase';

// Create a browser router with the routes
const router = createBrowserRouter(routes);

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthToken(session?.access_token || null);
      setLoading(false);
    };
    
    checkSession();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthToken(session?.access_token || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (token: string) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <>
      <Helmet>
        <title>Easy Shop Manager</title>
      </Helmet>

      <RouterProvider router={router} />
      
      <Toaster />
    </>
  );
}

export default App;
