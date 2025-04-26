
import React from 'react';
import { ChatMessage } from '@/types/chat';

interface ChatFileMessageProps {
  message: ChatMessage;
}

export const ChatFileMessage: React.FC<ChatFileMessageProps> = ({ message }) => {
  if (!message.file_url) return null;

  let fileUrl = '';
  let fileType = 'file';

  // Parse the file URL which is typically in the format "type:url"
  if (message.file_url.includes(':')) {
    const parts = message.file_url.split(':');
    fileType = parts[0];
    fileUrl = parts.slice(1).join(':'); // Handle URLs that might contain colons
  } else {
    fileUrl = message.file_url;
  }

  switch (fileType) {
    case 'image':
      return (
        <div className="mb-2">
          <img 
            src={fileUrl} 
            alt="Shared image" 
            className="max-w-full rounded-md object-cover max-h-[300px]" 
          />
          {message.content && message.content !== `Shared a ${fileType} file` && (
            <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      );

    case 'video':
      return (
        <div className="mb-2">
          <video 
            src={fileUrl} 
            controls 
            className="max-w-full rounded-md max-h-[300px]"
          />
          {message.content && message.content !== `Shared a ${fileType} file` && (
            <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className="mb-2">
          <audio 
            src={fileUrl} 
            controls 
            className="w-full"
          />
          {message.content && message.content !== `Shared a ${fileType} file` && (
            <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      );

    case 'document':
    case 'file':
    default:
      return (
        <div className="mb-2">
          <div className="flex items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
            <span className="mr-2">📄</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm">
                {message.file_url.split('/').pop() || 'File attachment'}
              </p>
            </div>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              View
            </a>
          </div>
          {message.content && message.content !== `Shared a ${fileType} file` && (
            <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      );
  }
};
