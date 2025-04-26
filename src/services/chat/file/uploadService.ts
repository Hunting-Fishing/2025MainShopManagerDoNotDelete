
import { supabase } from '@/lib/supabase';

// Define the ChatFileInfo type
export interface ChatFileInfo {
  url: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'document';
  name: string;
  size: number;
  contentType: string;
}

// Function to upload files to storage and return file info
export const uploadChatFile = async (roomId: string, file: File): Promise<ChatFileInfo> => {
  try {
    // Create a unique file path using roomId and timestamp
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = `chat/${roomId}/${fileName}`;
    
    // For this implementation, we'll create a temporary URL
    // In a real app, you would upload the file to Supabase storage
    const url = URL.createObjectURL(file);
    
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
    
    // Return file info
    return {
      url,
      type,
      name: file.name,
      size: file.size,
      contentType: file.type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed');
  }
};
