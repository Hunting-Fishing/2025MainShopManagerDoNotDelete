
import React from 'react';
import { Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: Array<{ id: string; name?: string }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center text-xs text-slate-500 p-2">
      <Loader2 className="h-3 w-3 animate-spin mr-2" />
      {formatTypingMessage(typingUsers)}
    </div>
  );
};

// Helper function to format typing message based on number of users
const formatTypingMessage = (users: Array<{ id: string; name?: string }>): React.ReactNode => {
  if (users.length === 0) return null;
  
  if (users.length === 1) {
    return (
      <span>
        <span className="font-medium">{users[0].name || 'Someone'}</span> is typing...
      </span>
    );
  }
  
  if (users.length === 2) {
    return (
      <span>
        <span className="font-medium">{users[0].name || 'Someone'}</span> and{' '}
        <span className="font-medium">{users[1].name || 'someone'}</span> are typing...
      </span>
    );
  }
  
  return (
    <span>
      <span className="font-medium">{users.length} people</span> are typing...
    </span>
  );
};
