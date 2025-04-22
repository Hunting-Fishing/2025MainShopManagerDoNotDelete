
import { supabase } from '@/lib/supabase';
import { ChatFileInfo } from './types';
import { validateFile } from './fileValidation';

export const uploadChatFile = async (
  roomId: string,
  file: File
): Promise<ChatFileInfo> => {
  try {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Determine file type category
    let fileType = getFileType(file.type);

    // Create a unique file path with room organization
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `chat/${roomId}/${fileName}`;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('chat_files')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600'
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
      size: file.size,
      contentType: file.type
    };
    
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(validation.error || 'File upload failed');
  }
};

const getFileType = (mimeType: string): ChatFileInfo['type'] => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType === 'application/pdf' || 
    mimeType.includes('document') ||
    mimeType.includes('msword')
  ) return 'document';
  return 'file';
};
