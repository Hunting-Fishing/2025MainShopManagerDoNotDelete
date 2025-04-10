
import React from 'react';
import { useNotifications } from '@/context/notifications';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AddNotificationDemo() {
  const { triggerTestNotification } = useNotifications();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };

    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleTestNotification = async () => {
    if (!isAuthenticated) {
      alert('You need to be signed in to create notifications');
      return;
    }
    
    setIsLoading(true);
    try {
      await triggerTestNotification();
    } catch (error) {
      console.error('Error creating test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" className="ml-auto" disabled title="Sign in to create notifications">
        <AlertCircle className="mr-2 h-4 w-4" />
        Test Notification
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="ml-auto"
      onClick={handleTestNotification}
      disabled={isLoading}
    >
      <AlertCircle className="mr-2 h-4 w-4" />
      Test Notification
    </Button>
  );
}
