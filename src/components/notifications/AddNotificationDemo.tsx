
import React from 'react';
import { useNotifications } from '@/context/notifications';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
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

  const handleCreateNotification = async () => {
    if (!isAuthenticated) {
      alert('You need to be signed in to create notifications');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { error } = await supabase.from('notifications').insert({
        user_id: userData.user.id,
        title: 'New Notification',
        content: 'This is a real notification from the database.',
        type: 'info',
        read: false
      });
      
      if (error) throw error;
      
      // Refresh notifications
      if (triggerTestNotification) {
        await triggerTestNotification();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" className="ml-auto" disabled title="Sign in to create notifications">
        <Bell className="mr-2 h-4 w-4" />
        Create Notification
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="ml-auto"
      onClick={handleCreateNotification}
      disabled={isLoading}
    >
      <Bell className="mr-2 h-4 w-4" />
      Create Notification
    </Button>
  );
}
