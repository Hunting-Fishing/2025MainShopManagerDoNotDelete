
import React, { ReactNode } from 'react';

interface MessageBubbleProps {
  children: ReactNode;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ children, isCurrentUser }) => {
  return (
    <div className={`rounded-lg p-3 max-w-[80%] ${
      isCurrentUser 
        ? 'ml-auto bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
        : 'mr-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
    }`}>
      {children}
    </div>
  );
};
