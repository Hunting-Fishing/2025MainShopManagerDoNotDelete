
import { ChatFileInfo, FileMessageContent } from './types';

export const formatFileMessage = (fileInfo: ChatFileInfo, caption?: string): string => {
  const fileData = `${fileInfo.type}:${fileInfo.url}|${fileInfo.name}|${fileInfo.size}|${fileInfo.contentType}`;
  return caption ? `${fileData}|${caption}` : fileData;
};

export const parseFileMessage = (content: string): FileMessageContent | null => {
  try {
    const parts = content.split('|');
    if (parts.length < 4) return null;

    const [typeAndUrl, name, size, contentType, ...captionParts] = parts;
    const [type, url] = typeAndUrl.split(':');

    if (!type || !url) return null;

    const fileInfo: ChatFileInfo = {
      type: type as ChatFileInfo['type'],
      url,
      name,
      size: parseInt(size, 10),
      contentType
    };

    return {
      fileInfo,
      caption: captionParts.length > 0 ? captionParts.join('|') : undefined
    };
  } catch (error) {
    console.error('Failed to parse file message:', error);
    return null;
  }
};
