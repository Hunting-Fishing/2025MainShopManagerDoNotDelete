
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bell, BellOff, AlertCircle, CheckCircle, Info, Settings, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as notificationsService from '@/services/notifications/notificationsService';
import type { Notification, NotificationPreferences } from '@/types/notification';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const loadNotifications = async () => {
    try {
      const userNotifications = await notificationsService.getNotifications('current-user');
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications.",
        variant: "destructive",
      });
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const userPreferences = await notificationsService.getNotificationPreferences('current-user');
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error", 
        description: "Failed to load notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllNotificationsAsRead('current-user');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      await notificationsService.updateNotificationPreferences('current-user', updatedPreferences);
      setPreferences(updatedPreferences);
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

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
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </Badge>
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
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BellOff className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
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
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
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
                      checked={preferences?.email || false}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('email', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push</span>
                    <Switch
                      checked={preferences?.push || false}
                      onCheckedChange={(checked) => 
                        handlePreferenceChange('push', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In-App</span>
                    <Switch
                      checked={preferences?.inApp || false}
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
                  {preferences?.categories && Object.entries(preferences.categories).map(([category, enabled]) => (
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
                    checked={preferences?.quietHours?.enabled || false}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('quietHours', {
                        ...preferences?.quietHours,
                        enabled: checked
                      })
                    }
                  />
                </div>
                {preferences?.quietHours?.enabled && (
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
