
import { useContext } from 'react';
import { NotificationsContext } from './NotificationsProvider';

export const useNotifications = () => {
  return useContext(NotificationsContext);
};
