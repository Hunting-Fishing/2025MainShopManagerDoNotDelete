
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-900'} px-4 py-2 rounded-lg`}>
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1">{message.sender_name}</div>
        )}
        <div className="text-sm break-words">{message.content}</div>
        <div className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-slate-500'}`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};
