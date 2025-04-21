
import React from 'react';
import { ChatMessage } from '@/types/chat';
import { FileIcon, FileText, Image, Music, Video } from 'lucide-react';

interface ChatFileMessageProps {
  message: ChatMessage;
}

export const ChatFileMessage: React.FC<ChatFileMessageProps> = ({ message }) => {
  const { message_type, content, file_url } = message;
  
  // Extract file info
  const url = file_url || (content && content.includes(':') ? content.split(':')[1] : '');
  const fileType = message_type || (content && content.includes(':') ? content.split(':')[0] : 'file');
  
  // If no valid URL is available, show a generic message
  if (!url) {
    return <p>File attachment unavailable</p>;
  }

  // Show different preview based on file type
  switch (fileType) {
    case 'image':
      return (
        <div className="max-w-xs overflow-hidden">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img 
              src={url} 
              alt="Image attachment" 
              className="max-w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" 
            />
          </a>
        </div>
      );
      
    case 'audio':
      return (
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          <audio controls className="max-w-full">
            <source src={url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
      
    case 'video':
      return (
        <div className="max-w-xs">
          <Video className="h-5 w-5 mb-1" />
          <video controls className="max-w-full rounded">
            <source src={url} />
            Your browser does not support the video element.
          </video>
        </div>
      );
      
    default:
      // For documents and other files
      const fileName = url.split('/').pop() || 'file';
      return (
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {fileType === 'document' ? (
            <FileText className="h-5 w-5" />
          ) : (
            <FileIcon className="h-5 w-5" />
          )}
          <span className="text-sm truncate max-w-[200px]">{fileName}</span>
        </a>
      );
  }
};
