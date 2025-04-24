
import React from 'react';

interface CustomerMessageProps {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
  };
  isOwn?: boolean;
}

export const CustomerMessage: React.FC<CustomerMessageProps> = ({ message, isOwn = false }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`px-4 py-2 rounded-lg max-w-[80%] ${
          isOwn 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <p>{message.content}</p>
        <span className={`text-xs block mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
