
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

// Function to format file message strings for sending
export const formatFileMessage = (fileInfo: ChatFileInfo): string => {
  const { type, url, name, size, contentType } = fileInfo;
  return `${type}:${url}|${name}|${size}|${contentType}`;
};

// Function to parse file info from a message content string
export const parseFileFromMessage = (content: string): { fileInfo: ChatFileInfo | null, text: string } => {
  // Check if the content starts with a file type identifier
  const fileTypes = ['image:', 'video:', 'audio:', 'file:', 'document:'];
  const fileTypeMatch = fileTypes.find(type => content.startsWith(type));
  
  if (!fileTypeMatch) {
    return { fileInfo: null, text: content };
  }
  
  const type = fileTypeMatch.replace(':', '') as 'image' | 'video' | 'audio' | 'file' | 'document';
  
  // Remove the file type prefix
  const fileContent = content.substring(fileTypeMatch.length);
  
  // Split the file content by the separator character
  const parts = fileContent.split('|');
  
  // Must have at least URL
  if (parts.length === 0) {
    return { fileInfo: null, text: content };
  }
  
  const url = parts[0];
  const name = parts.length > 1 ? parts[1] : 'file';
  const size = parts.length > 2 ? parseInt(parts[2], 10) : 0;
  const contentType = parts.length > 3 ? parts[3] : `${type}/*`;
  
  // If there's a caption (additional text after the file info), extract it
  const caption = parts.length > 4 ? parts.slice(4).join('|') : '';
  
  const fileInfo: ChatFileInfo = {
    url,
    type,
    name,
    size,
    contentType
  };
  
  return { fileInfo, text: caption };
};
