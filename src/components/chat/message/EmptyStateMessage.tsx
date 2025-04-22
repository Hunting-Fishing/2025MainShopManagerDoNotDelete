
import React from 'react';
import { Clipboard, MessageSquare } from 'lucide-react';

interface EmptyStateMessageProps {
  type: 'no-room' | 'no-messages';
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ type }) => {
  if (type === 'no-room') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Clipboard className="h-12 w-12 mb-2" />
        <p className="text-center">Select a conversation</p>
        <p className="text-center text-sm">or start a new one</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <MessageSquare className="h-12 w-12 mb-2" />
      <p className="text-center">No messages yet</p>
      <p className="text-center text-sm">Start the conversation!</p>
    </div>
  );
};
