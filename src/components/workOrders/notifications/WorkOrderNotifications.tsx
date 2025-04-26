
import React, { useState, useEffect } from 'react';
import { NotificationsList } from './NotificationsList';
import { WorkOrderNotification } from '@/types/notification';

interface WorkOrderNotificationsProps {
  workOrderId: string;
}

export const WorkOrderNotifications: React.FC<WorkOrderNotificationsProps> = ({ workOrderId }) => {
  const [notifications, setNotifications] = useState<WorkOrderNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a successful response with mock data
        setTimeout(() => {
          const mockNotifications: WorkOrderNotification[] = [
            {
              id: '1',
              workOrderId,
              title: 'Work Order Created',
              message: 'Work order has been created successfully',
              read: false,
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              category: 'workOrders',
              type: 'success',
              status: 'created'
            },
            {
              id: '2',
              workOrderId,
              title: 'Technician Assigned',
              message: 'John Doe has been assigned to this work order',
              read: true,
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              category: 'workOrders',
              type: 'info',
              status: 'assigned'
            }
          ];
          
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching work order notifications:', error);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [workOrderId]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => notification.id === id ? { ...notification, read: true } : notification)
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notifications</h3>
      <NotificationsList 
        notifications={notifications} 
        loading={loading}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};
