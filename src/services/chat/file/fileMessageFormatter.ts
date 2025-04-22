
import { ChatFileInfo } from './types';
import { FileMessageContent } from './types';

export const formatFileMessage = (fileInfo: ChatFileInfo, caption?: string): string => {
  if (!fileInfo) return '';
  
  const fileData = {
    type: fileInfo.type,
    url: fileInfo.url,
    name: fileInfo.name,
    size: fileInfo.size,
    contentType: fileInfo.contentType
  };
  
  const content: FileMessageContent = {
    fileInfo: fileData,
    caption: caption || ''
  };
  
  return JSON.stringify(content);
};

export const parseFileFromMessage = (fileUrl: string): { fileInfo: ChatFileInfo | null; text: string } => {
  if (!fileUrl) {
    return { fileInfo: null, text: '' };
  }

  // Check if the file URL is in the format "type:url"
  if (fileUrl.includes(':')) {
    const parts = fileUrl.split(':');
    const fileType = parts[0] as 'image' | 'video' | 'audio' | 'file' | 'document';
    const url = parts.slice(1).join(':'); // Handle URLs that might contain colons
    
    return {
      fileInfo: {
        type: fileType,
        url: url,
        name: url.split('/').pop() || 'File',
        size: 0,
        contentType: fileType === 'image' ? 'image/jpeg' : 
                    fileType === 'video' ? 'video/mp4' : 
                    fileType === 'audio' ? 'audio/mp3' : 'application/octet-stream'
      },
      text: ''
    };
  }
  
  // If not in the expected format, return default values
  return { 
    fileInfo: {
      type: 'file',
      url: fileUrl,
      name: fileUrl.split('/').pop() || 'File',
      size: 0,
      contentType: 'application/octet-stream'
    },
    text: ''
  };
};
