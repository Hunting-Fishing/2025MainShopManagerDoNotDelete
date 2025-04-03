
import { supabase } from "./supabaseClient";
import { toast } from "@/hooks/use-toast";

// File types we support
export type ChatFileType = 'image' | 'audio' | 'video' | 'document' | 'other';

// Interface for uploaded file info
export interface ChatFileInfo {
  url: string;
  type: ChatFileType;
  name: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file to the chat attachments bucket
 */
export const uploadChatFile = async (
  roomId: string, 
  file: File
): Promise<ChatFileInfo | null> => {
  try {
    // Check file size (limit to 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "The maximum file size is 50MB",
        variant: "destructive"
      });
      return null;
    }

    // Get file type and create appropriate path
    const fileType = getFileType(file.type);
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${roomId}/${fileType}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(filePath);
    
    return {
      url: urlData.publicUrl,
      type: fileType,
      name: file.name,
      size: file.size,
      contentType: file.type
    };
    
  } catch (error) {
    console.error("Error uploading file:", error);
    toast({
      title: "Upload failed",
      description: "Failed to upload file. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Determine file type based on MIME type
 */
export const getFileType = (mimeType: string): ChatFileType => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (
    mimeType === 'application/pdf' || 
    mimeType.includes('word') || 
    mimeType.includes('excel') || 
    mimeType.includes('powerpoint') || 
    mimeType.includes('text/')
  ) return 'document';
  
  return 'other';
};

/**
 * Parse file information from a message content
 * Handles messages with file references
 */
export const parseFileFromMessage = (content: string): { fileInfo: ChatFileInfo | null, text: string } => {
  // Check if content starts with a file reference pattern
  const filePattern = /^(file|image|audio|video|document):([^|]+)\|?(.*)$/;
  const match = content.match(filePattern);
  
  if (!match) {
    return { fileInfo: null, text: content };
  }
  
  const [, typeHint, url, text] = match;
  let fileType: ChatFileType = 'other';
  
  // Map the type hint to our ChatFileType
  switch(typeHint) {
    case 'image': fileType = 'image'; break;
    case 'audio': fileType = 'audio'; break;
    case 'video': fileType = 'video'; break;
    case 'document': fileType = 'document'; break;
    case 'file': fileType = 'other'; break;
  }

  // Extract file name from URL
  const fileName = url.split('/').pop() || 'file';
  
  // Create file info object
  const fileInfo: ChatFileInfo = {
    url,
    type: fileType,
    name: fileName,
    size: 0, // We don't know the size from just the URL
    contentType: typeHint === 'audio' ? 'audio/webm' : 'application/octet-stream'
  };
  
  return { 
    fileInfo, 
    text: text || '' // Use any text that came after the file reference
  };
};

/**
 * Format a file message for sending
 */
export const formatFileMessage = (fileInfo: ChatFileInfo, caption?: string): string => {
  return `${fileInfo.type}:${fileInfo.url}|${caption || ''}`;
};

/**
 * Handle voice recording upload
 */
export const uploadVoiceRecording = async (
  roomId: string,
  audioBlob: Blob
): Promise<ChatFileInfo | null> => {
  try {
    // Create a File object from the Blob
    const file = new File([audioBlob], `voice_${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    
    return await uploadChatFile(roomId, file);
  } catch (error) {
    console.error("Error uploading voice recording:", error);
    toast({
      title: "Upload failed",
      description: "Failed to send voice message. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
