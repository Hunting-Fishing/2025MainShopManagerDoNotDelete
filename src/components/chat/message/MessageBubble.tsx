
import React from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  isCurrentUser: boolean;
  children: React.ReactNode;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  isCurrentUser,
  children,
  className
}) => {
  return (
    <div 
      className={cn(
        "max-w-3/4 p-3 rounded-lg shadow-sm",
        isCurrentUser ? "bg-esm-blue-100 dark:bg-esm-blue-900/30" : "bg-white dark:bg-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
};
