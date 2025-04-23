
import React from 'react';
import { Bell, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';

interface ReminderBadgeProps {
  reminderType: string;
  dueDate: string;
  priority: string;
  onClick?: () => void;
}

export const ReminderBadge: React.FC<ReminderBadgeProps> = ({
  reminderType,
  dueDate,
  priority,
  onClick
}) => {
  const getPriorityColorClasses = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Bell className="h-3.5 w-3.5 mr-1" />;
      case 'follow_up':
        return <Calendar className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Bell className="h-3.5 w-3.5 mr-1" />;
    }
  };

  const formatReminderType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 shadow-sm ${getPriorityColorClasses(priority)}`}
    >
      {getTypeIcon(reminderType)}
      <span className="font-semibold">{formatReminderType(reminderType)} Reminder</span>
      <span className="mx-1 text-gray-500">•</span>
      <span className="whitespace-nowrap">Due: {formatDate(dueDate)}</span>
    </Button>
  );
};
