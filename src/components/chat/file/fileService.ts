
import { supabase } from '@/integrations/supabase/client';

export interface ChatFileInfo {
  url: string;
  type: string;
  name: string;
  contentType: string;
  size: number;
}

export const uploadChatFile = async (
  roomId: string,
  file: File
): Promise<ChatFileInfo | null> => {
  try {
    // Determine file type category
    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      fileType = 'document';
    }

    // Create a unique file path
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `chat/${roomId}/${fileName}`;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('chat_files')
      .upload(filePath, file, {
        contentType: file.type
      });
      
    if (error) throw error;
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('chat_files')
      .getPublicUrl(filePath);
    
    return {
      url: publicUrl,
      type: fileType,
      name: file.name,
      contentType: file.type,
      size: file.size
    };
    
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const parseFileFromMessage = (content: string) => {
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
