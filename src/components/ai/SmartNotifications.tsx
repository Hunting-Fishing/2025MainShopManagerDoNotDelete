import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle, X, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'info' | 'warning' | 'error' | 'success';
  user_id: string;
  created_at: string;
  read: boolean;
  ai_generated: boolean;
  metadata?: any;
}

export const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Since smart_notifications table doesn't exist yet, we'll simulate it
      // In a real implementation, this would query the smart_notifications table
      const mockNotifications: SmartNotification[] = [
        {
          id: '1',
          title: 'Inventory Alert',
          message: 'Low stock detected for brake pads. Only 3 units remaining.',
          priority: 'high',
          type: 'warning',
          user_id: user.id,
          created_at: new Date().toISOString(),
          read: false,
          ai_generated: true,
          metadata: { item: 'brake_pads', quantity: 3 }
        },
        {
          id: '2',
          title: 'Revenue Opportunity',
          message: 'Customer John Smith is due for oil change service based on mileage.',
          priority: 'medium',
          type: 'info',
          user_id: user.id,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          ai_generated: true,
          metadata: { customer: 'John Smith', service: 'oil_change' }
        },
        {
          id: '3',
          title: 'Performance Insight',
          message: 'Your team completed 25% more work orders this week compared to last week.',
          priority: 'low',
          type: 'success',
          user_id: user.id,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          ai_generated: true,
          metadata: { improvement: '25%', metric: 'work_orders' }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch smart notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
    
    // In real implementation, update the database
    // await supabase.from('smart_notifications').update({ read: true }).eq('id', notificationId);
  };

  const dismissNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    // In real implementation, delete from database or mark as dismissed
    // await supabase.from('smart_notifications').delete().eq('id', notificationId);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'info':
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    if (filter === 'ai') return notif.ai_generated;
    return notif.priority === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'ai', label: 'AI Generated' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High Priority' }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Notifications</CardTitle>
          <CardDescription>Loading notifications...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Smart Notifications
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered notifications to keep you informed about important business events
        </CardDescription>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap pt-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border rounded-lg p-4 space-y-3 ${
                  !notification.read ? 'border-l-4 border-l-primary bg-muted/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)} text-white`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        {notification.ai_generated && (
                          <div title="AI Generated">
                            <Brain className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground ml-11">
                  {notification.message}
                </p>
                
                {notification.metadata && (
                  <div className="text-xs text-muted-foreground ml-11">
                    <div className="flex gap-4">
                      {notification.metadata.item && (
                        <span>Item: {notification.metadata.item}</span>
                      )}
                      {notification.metadata.customer && (
                        <span>Customer: {notification.metadata.customer}</span>
                      )}
                      {notification.metadata.metric && (
                        <span>Metric: {notification.metadata.metric}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};