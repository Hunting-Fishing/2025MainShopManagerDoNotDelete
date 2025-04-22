
import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: Array<{ id: string; name?: string }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 shadow-sm border border-slate-100 dark:border-slate-700 transition-all">
      <div className="flex items-center space-x-1 mr-2">
        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      {formatTypingMessage(typingUsers)}
    </div>
  );
};

// Helper function to format typing message based on number of users
const formatTypingMessage = (users: Array<{ id: string; name?: string }>): React.ReactNode => {
  if (users.length === 0) return null;
  
  if (users.length === 1) {
    return (
      <span className="text-slate-600 dark:text-slate-300">
        <span className="font-medium text-indigo-600 dark:text-indigo-400">{users[0].name || 'Someone'}</span> is typing...
      </span>
    );
  }
  
  if (users.length === 2) {
    return (
      <span className="text-slate-600 dark:text-slate-300">
        <span className="font-medium text-indigo-600 dark:text-indigo-400">{users[0].name || 'Someone'}</span> and{' '}
        <span className="font-medium text-indigo-600 dark:text-indigo-400">{users[1].name || 'someone'}</span> are typing...
      </span>
    );
  }
  
  return (
    <span className="text-slate-600 dark:text-slate-300">
      <span className="font-medium text-indigo-600 dark:text-indigo-400">{users.length} people</span> are typing...
    </span>
  );
};
