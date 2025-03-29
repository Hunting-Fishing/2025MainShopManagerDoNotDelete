
import { NotificationPreferences } from '@/types/notification';

export const createUpdatePreferencesHandler = (
  setPreferences: React.Dispatch<React.SetStateAction<NotificationPreferences>>
) => {
  return (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPrefs
    }));
  };
};

export const createUpdateSubscriptionHandler = (
  setPreferences: React.Dispatch<React.SetStateAction<NotificationPreferences>>
) => {
  return (category: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub => 
        sub.category === category ? { ...sub, enabled } : sub
      )
    }));
  };
};
