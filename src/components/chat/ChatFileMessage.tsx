
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
    <div>
      <FilePreview fileInfo={fileInfo} />
      {text && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {text}
        </p>
      )}
    </div>
  );
};
