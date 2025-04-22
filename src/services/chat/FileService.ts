
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ChatFileInfo {
  url: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'document';
  name: string;
  size: number;
  contentType: string;
}

export class FileService {
  /**
   * Upload file to chat storage
   */
  static async uploadChatFile(roomId: string, file: File): Promise<ChatFileInfo> {
    try {
      // Create a unique file path using roomId and timestamp
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `chat/${roomId}/${fileName}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file, {
          contentType: file.type
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);
      
      // Determine file type
      let type: ChatFileInfo['type'] = 'file';
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      } else if (
        file.type === 'application/pdf' || 
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        type = 'document';
      }
      
      return {
        url: publicUrl,
        type,
        name: file.name,
        size: file.size,
        contentType: file.type
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
  }

  /**
   * Utility method to parse file message
   */
  static parseFileMessage(content: string): { fileInfo: ChatFileInfo | null, text: string } {
    const fileTypes = ['image:', 'video:', 'audio:', 'file:', 'document:'];
    const fileTypeMatch = fileTypes.find(type => content.startsWith(type));
    
    if (!fileTypeMatch) {
      return { fileInfo: null, text: content };
    }
    
    const type = fileTypeMatch.replace(':', '') as ChatFileInfo['type'];
    const fileContent = content.substring(fileTypeMatch.length);
    const parts = fileContent.split('|');
    
    if (parts.length === 0) {
      return { fileInfo: null, text: content };
    }
    
    const url = parts[0];
    const name = parts.length > 1 ? parts[1] : 'file';
    const size = parts.length > 2 ? parseInt(parts[2], 10) : 0;
    const contentType = parts.length > 3 ? parts[3] : `${type}/*`;
    
    const caption = parts.length > 4 ? parts.slice(4).join('|') : '';
    
    const fileInfo: ChatFileInfo = {
      url,
      type,
      name,
      size,
      contentType
    };
    
    return { fileInfo, text: caption };
  }

  /**
   * Format file message for storage
   */
  static formatFileMessage(fileInfo: ChatFileInfo): string {
    const { type, url, name, size, contentType } = fileInfo;
    return `${type}:${url}|${name}|${size}|${contentType}`;
  }
}

// Export for convenience
export const { uploadChatFile, parseFileMessage, formatFileMessage } = FileService;
