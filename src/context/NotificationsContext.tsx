
import React, { createContext, useContext, useEffect, useState } from "react";

type NotificationContextType = {
  unreadCount: number;
  showNotifications: () => void;
  triggerTestNotification: () => void;
};

const NotificationsContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate some notifications loading
    setTimeout(() => {
      setUnreadCount(2);
    }, 2000);
  }, []);

  const showNotifications = () => {
    console.log("Showing notifications panel");
    // In a real app, this would open a notifications panel
    setUnreadCount(0);
  };

  const triggerTestNotification = () => {
    console.log("Triggering test notification");
    setUnreadCount(prevCount => prevCount + 1);
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        unreadCount, 
        showNotifications,
        triggerTestNotification
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
