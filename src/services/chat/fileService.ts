
import { uploadChatFile } from './file/fileService';
import { formatFileMessage, parseFileMessage } from './file';

// Re-export functions
export { 
  uploadChatFile, 
  formatFileMessage, 
  parseFileMessage
};

// Re-export types using the correct syntax
export type { ChatFileInfo } from './file';
