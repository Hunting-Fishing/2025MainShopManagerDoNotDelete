
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';
import { Check, Info, AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onClear }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear(notification.id);
  };

  // Format the timestamp
  const formattedTime = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  // Determine the icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const Content = () => (
    <div className={cn(
      "flex items-start p-3 gap-3 border-b border-slate-100 hover:bg-slate-50 transition-colors",
      !notification.read && "bg-slate-50",
    )}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className={cn(
            "text-sm font-medium",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          <button 
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 mb-1">{notification.message}</p>
        <p className="text-xs text-slate-400">{formattedTime}</p>
        {!notification.read && (
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full absolute top-3 right-3"></span>
        )}
      </div>
    </div>
  );

  return notification.link ? (
    <Link to={notification.link} className="block" onClick={handleClick}>
      <Content />
    </Link>
  ) : (
    <div onClick={handleClick}>
      <Content />
    </div>
  );
}
