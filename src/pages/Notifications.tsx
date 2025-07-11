
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, AlertCircle, CheckCircle, Info, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Notification, NotificationPreferences } from '@/types/notification';

// Mock data - replace with real service calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Maintenance Overdue',
    message: 'Equipment XYZ-123 maintenance is 3 days overdue',
    type: 'warning',
    category: 'work-order',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    actionUrl: '/maintenance'
  },
  {
    id: '2',
    title: 'New Work Order',
    message: 'Work order #WO-2024-001 has been assigned to you',
    type: 'info',
    category: 'work-order',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium'
  }
];

const mockPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  email: true,
  push: true,
  inApp: true,
  categories: {
    system: true,
    'work-order': true,
    inventory: true,
    customer: false,
    team: true,
    chat: true,
    invoice: false
  },
  subscriptions: [],
  frequency: 'immediate',
  frequencies: {},
  sound: 'default',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(mockPreferences);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info': 
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} unread</Badge>
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BellOff className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        !notification.read 
                          ? 'bg-muted/50 border-primary/20' 
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <Badge variant={getPriorityColor(notification.priority || 'medium')} className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div>
                <h4 className="font-medium mb-3">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email</span>
                    <Switch
                      checked={preferences.email}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('email', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push</span>
                    <Switch
                      checked={preferences.push}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('push', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In-App</span>
                    <Switch
                      checked={preferences.inApp}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('inApp', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-3">
                  {Object.entries(preferences.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('categories', {
                            ...preferences.categories,
                            [category]: checked
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div>
                <h4 className="font-medium mb-3">Quiet Hours</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Enable quiet hours</span>
                  <Switch
                    checked={preferences.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('quietHours', {
                        ...preferences.quietHours,
                        enabled: checked
                      })
                    }
                  />
                </div>
                {preferences.quietHours.enabled && (
                  <div className="text-xs text-muted-foreground">
                    {preferences.quietHours.start} - {preferences.quietHours.end}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
