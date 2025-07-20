
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notificationControlService } from '@/services/notifications/notificationControlService';
import { NotificationPreferences } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';
import { NotificationCategoriesCard } from './NotificationCategoriesCard';
import { NotificationFrequencyCard } from './NotificationFrequencyCard';
import { NotificationSoundCard } from './NotificationSoundCard';
import { ConnectionStatusCard } from './ConnectionStatusCard';
import { SaveButton } from './SaveButton';

export function NotificationsTab() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'changed'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      // Mock user ID - in real app this would come from auth context
      const userId = 'current-user-id';
      const prefs = await notificationControlService.getUserNotificationPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (updates: Partial<NotificationPreferences>) => {
    if (preferences) {
      setPreferences({ ...preferences, ...updates });
      setSaveStatus('changed');
    }
  };

  const handleSubscriptionToggle = (category: string) => {
    if (preferences) {
      const updatedSubscriptions = preferences.subscriptions.map(sub =>
        sub.category === category ? { ...sub, enabled: !sub.enabled } : sub
      );
      handlePreferenceChange({ subscriptions: updatedSubscriptions });
    }
  };

  const handleFrequencyChange = (category: string, frequency: 'realtime' | 'hourly' | 'daily' | 'weekly') => {
    if (preferences) {
      const updatedFrequencies = {
        ...preferences.frequencies,
        [category]: frequency
      };
      handlePreferenceChange({ frequencies: updatedFrequencies });
    }
  };

  const handleSoundChange = (sound: string) => {
    handlePreferenceChange({ sound });
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      const userId = 'current-user-id';
      await notificationControlService.updateNotificationPreferences(userId, preferences);
      setSaveStatus('saved');
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated",
      });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = () => {
    toast({
      title: "Test Notification",
      description: "This is a test notification to preview your settings",
    });
  };

  if (loading || !preferences) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p>Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <p className="text-muted-foreground">
            Control how and when you receive notifications
          </p>
        </CardHeader>
      </Card>

      <ConnectionStatusCard
        connectionStatus={true}
        onTestNotification={handleTestNotification}
      />

      <NotificationCategoriesCard
        preferences={preferences}
        onSubscriptionToggle={handleSubscriptionToggle}
      />

      <NotificationFrequencyCard
        preferences={preferences}
        onFrequencyChange={handleFrequencyChange}
      />

      <NotificationSoundCard
        selectedSound={preferences.sound}
        onSoundChange={handleSoundChange}
      />

      <SaveButton saveStatus={saveStatus} onSave={handleSave} />
    </div>
  );
}
