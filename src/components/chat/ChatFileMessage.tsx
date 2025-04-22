
import React from 'react';
import { ChatMessage } from '@/types/chat';
import { parseFileFromMessage } from '@/services/chat/file';
import { FilePreview } from './file/FilePreview';

interface ChatFileMessageProps {
  message: ChatMessage;
}

export const ChatFileMessage: React.FC<ChatFileMessageProps> = ({ message }) => {
  if (!message.file_url) return null;

  const { fileInfo, text } = parseFileFromMessage(message.file_url);
  
  if (!fileInfo) return null;

  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-200">
      <FilePreview fileInfo={fileInfo} />
      {text && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 pl-1">
          {text}
        </p>
      )}
    </div>
  );
};
