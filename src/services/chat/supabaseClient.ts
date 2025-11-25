
// Define the types for Supabase responses
export interface DatabaseChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'work_order';
  work_order_id?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  metadata?: Record<string, any>;
  retention_period?: number;
  retention_type?: string;
}

export interface DatabaseChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  message_type?: string;
  file_url?: string;
  reply_to_id?: string;
  is_flagged?: boolean;
  flag_reason?: string;
  metadata?: Record<string, any>;
  is_edited?: boolean;
  edited_at?: string;
  original_content?: string;
  thread_parent_id?: string;
  thread_count?: number;
}

export interface DatabaseChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
}

import { supabase } from '@/integrations/supabase/client';
export { supabase };

// Function to upload chat files
export const uploadChatFile = async (roomId: string, file: File): Promise<any> => {
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
    let type: 'image' | 'video' | 'audio' | 'file' | 'document' = 'file';
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
