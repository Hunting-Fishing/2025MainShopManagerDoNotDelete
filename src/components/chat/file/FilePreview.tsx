
import React from 'react';
import { File, FileAudio, FileImage, FileVideo, FileText } from 'lucide-react';
import { ChatFileInfo } from '@/services/chat/file/types';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  fileInfo: ChatFileInfo;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileInfo, className }) => {
  const getFileTypeStyles = () => {
    switch (fileInfo.type) {
      case 'image':
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 'video':
        return "bg-purple-100 text-purple-800 border-purple-300";
      case 'audio':
        return "bg-green-100 text-green-800 border-green-300";
      case 'document':
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const renderFileTypeTag = () => {
    return (
      <span className={cn(
        "px-2 py-0.5 text-xs font-medium rounded-full border inline-flex items-center gap-1",
        getFileTypeStyles()
      )}>
        {fileInfo.type.charAt(0).toUpperCase() + fileInfo.type.slice(1)}
      </span>
    );
  };

  const renderFilePreview = () => {
    switch (fileInfo.type) {
      case 'image':
        return (
          <div className="relative max-w-sm">
            <div className="absolute top-2 right-2">
              {renderFileTypeTag()}
            </div>
            <img 
              src={fileInfo.url} 
              alt={fileInfo.name}
              className="rounded-lg max-h-[200px] object-cover border border-blue-200 shadow-sm"
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative max-w-sm">
            <div className="absolute top-2 right-2">
              {renderFileTypeTag()}
            </div>
            <video 
              src={fileInfo.url} 
              controls 
              className="rounded-lg max-h-[200px] w-full border border-purple-200 shadow-sm"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-white border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium truncate">{fileInfo.name}</span>
              </div>
              {renderFileTypeTag()}
            </div>
            <audio src={fileInfo.url} controls className="max-w-[250px]" />
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-amber-200 shadow-sm">
            <FileText className="h-6 w-6 text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileInfo.name}</p>
              <p className="text-xs text-slate-500">
                {Math.round(fileInfo.size / 1024)} KB · {renderFileTypeTag()}
              </p>
            </div>
            <a 
              href={fileInfo.url}
              download={fileInfo.name}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <File className="h-6 w-6 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileInfo.name}</p>
              <p className="text-xs text-slate-500">
                {Math.round(fileInfo.size / 1024)} KB · {renderFileTypeTag()}
              </p>
            </div>
            <a 
              href={fileInfo.url}
              download={fileInfo.name}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
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
    <div className={cn("my-2", className)}>
      {renderFilePreview()}
    </div>
  );
};
