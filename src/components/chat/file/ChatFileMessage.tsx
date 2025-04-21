
import React from 'react';
import { ChatMessage } from '@/types/chat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileIcon, Image as ImageIcon, Film, FileAudio, FileText } from 'lucide-react';

interface ChatFileMessageProps {
  message: ChatMessage;
}

export const ChatFileMessage: React.FC<ChatFileMessageProps> = ({ message }) => {
  // Parse file URL from message content
  const parseFileFromMessage = (content: string) => {
    try {
      if (content.includes(':')) {
        const [type, url] = content.split(':');
        
        return {
          fileInfo: {
            type: type,
            url: url,
            name: url.split('/').pop() || 'file',
            contentType: getContentType(type),
            size: 0 // Size information might not be available in the message
          }
        };
      }
      
      return { fileInfo: null };
    } catch (error) {
      console.error('Failed to parse file message:', error);
      return { fileInfo: null };
    }
  };
  
  const getContentType = (type: string) => {
    switch (type) {
      case 'image': return 'image/jpeg';
      case 'video': return 'video/mp4';
      case 'audio': return 'audio/mpeg';
      case 'document': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  };
  
  // Extract file info from the message
  const { fileInfo } = parseFileFromMessage(message.content);
  
  if (!fileInfo) {
    return <p className="text-red-500">Invalid file message</p>;
  }
  
  const handleDownload = () => {
    window.open(fileInfo.url, '_blank');
  };

  // Render based on file type
  const renderFileContent = () => {
    switch (fileInfo.type) {
      case 'image':
        return (
          <div className="relative group">
            <img 
              src={fileInfo.url} 
              alt={message.content || 'Image'} 
              className="rounded-md max-h-64 max-w-full object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-1" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        );
        
      case 'audio':
        return (
          <div className="w-full">
            <audio controls className="w-full">
              <source src={fileInfo.url} type={fileInfo.contentType} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
        
      case 'video':
        return (
          <div className="w-full">
            <video 
              controls 
              className="rounded-md max-h-64 max-w-full"
            >
              <source src={fileInfo.url} type={fileInfo.contentType} />
              Your browser does not support the video element.
            </video>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-md">
            <FileIcon className="h-10 w-10 text-slate-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{fileInfo.name}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="flex-shrink-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="p-2 bg-transparent border-none shadow-none">
      {renderFileContent()}
    </Card>
  );
};
