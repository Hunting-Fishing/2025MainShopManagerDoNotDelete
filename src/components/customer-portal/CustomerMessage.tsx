
import React from 'react';
import { ChatMessage } from '@/types/chat';

interface CustomerMessageProps {
  message: ChatMessage;
  isCustomer?: boolean;
}

export const CustomerMessage: React.FC<CustomerMessageProps> = ({ message, isCustomer = false }) => {
  // Extract sender and timestamp from the message properties that exist
  const senderName = message.sender_name || message.sender_id || 'Unknown';
  const timestamp = message.created_at || new Date().toISOString();

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`px-4 py-2 rounded-lg max-w-[80%] ${
          isCustomer 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <p>{message.content}</p>
        <span className={`text-xs block mt-1 ${isCustomer ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
