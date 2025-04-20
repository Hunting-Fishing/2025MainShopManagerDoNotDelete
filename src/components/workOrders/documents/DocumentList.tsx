
import React from 'react';
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Clock, 
  Trash2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
  description?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const isPreviewable = (fileType: string) => {
    return fileType.startsWith('image/') || fileType === 'application/pdf';
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center space-x-4">
            {getFileIcon(doc.file_type)}
            <div>
              <h4 className="font-medium">{doc.file_name}</h4>
              {doc.description && (
                <p className="text-sm text-gray-500">{doc.description}</p>
              )}
              <p className="text-xs text-gray-400 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isPreviewable(doc.file_type) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewUrl(doc.file_url)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(doc.file_url, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(doc.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="aspect-video">
              {previewUrl.includes('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
