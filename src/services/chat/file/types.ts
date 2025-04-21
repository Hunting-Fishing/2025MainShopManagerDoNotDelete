
export interface ChatFileInfo {
  url: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'document';
  name: string;
  size: number;
  contentType: string;
}

export interface FileMessageContent {
  fileInfo: ChatFileInfo;
  caption?: string;
}
