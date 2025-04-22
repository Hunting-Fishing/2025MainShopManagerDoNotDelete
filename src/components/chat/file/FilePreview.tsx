
import React from 'react';
import { File, FileAudio, FileImage, FileVideo, FileText } from 'lucide-react';
import { ChatFileInfo } from '@/services/chat/file/types';

interface FilePreviewProps {
  fileInfo: ChatFileInfo;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileInfo }) => {
  const renderFilePreview = () => {
    switch (fileInfo.type) {
      case 'image':
        return (
          <div className="relative max-w-sm">
            <img 
              src={fileInfo.url} 
              alt={fileInfo.name}
              className="rounded-lg max-h-[200px] object-cover"
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative max-w-sm">
            <video 
              src={fileInfo.url} 
              controls 
              className="rounded-lg max-h-[200px] w-full"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <FileAudio className="h-5 w-5 text-blue-500" />
            <audio src={fileInfo.url} controls className="max-w-[250px]" />
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
            <FileText className="h-5 w-5 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileInfo.name}</p>
              <p className="text-xs text-slate-500">
                {Math.round(fileInfo.size / 1024)} KB
              </p>
            </div>
            <a 
              href={fileInfo.url}
              download={fileInfo.name}
              className="text-sm text-blue-500 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
            <File className="h-5 w-5 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileInfo.name}</p>
              <p className="text-xs text-slate-500">
                {Math.round(fileInfo.size / 1024)} KB
              </p>
            </div>
            <a 
              href={fileInfo.url}
              download={fileInfo.name}
              className="text-sm text-blue-500 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        );
    }
  };

  return (
    <div className="my-2">
      {renderFilePreview()}
    </div>
  );
};
