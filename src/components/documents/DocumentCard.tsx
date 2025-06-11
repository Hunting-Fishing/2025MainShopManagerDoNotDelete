
import React from 'react';
import { Document } from '@/types/document';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image, 
  Link, 
  ExternalLink, 
  Download, 
  Edit, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils/dateUtils';
import { DocumentService } from '@/services/documentService';

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DocumentCard({ document, onClick, onEdit, onDelete }: DocumentCardProps) {
  const getDocumentIcon = () => {
    switch (document.document_type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'weblink':
        return <ExternalLink className="h-8 w-8 text-green-500" />;
      case 'internal_link':
        return <Link className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getDocumentTypeLabel = () => {
    switch (document.document_type) {
      case 'pdf':
        return 'PDF';
      case 'image':
        return 'Image';
      case 'weblink':
        return 'Web Link';
      case 'internal_link':
        return 'Internal Link';
      default:
        return 'Document';
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.file_url) {
      await DocumentService.logAccess(document.id, 'download');
      window.open(document.file_url, '_blank');
    }
  };

  const handleView = async () => {
    await DocumentService.logAccess(document.id, 'view');
    onClick();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getDocumentIcon()}
            <div className="flex-1 min-w-0">
              <h3 
                className="text-sm font-medium text-gray-900 truncate hover:text-blue-600"
                onClick={handleView}
              >
                {document.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(document.created_at)}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <FileText className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {document.file_url && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {document.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {getDocumentTypeLabel()}
            </Badge>
            {document.category_name && (
              <Badge variant="outline" className="text-xs">
                {document.category_name}
              </Badge>
            )}
          </div>
          {document.file_size && (
            <span className="text-xs text-gray-400">
              {formatFileSize(document.file_size)}
            </span>
          )}
        </div>

        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{document.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-2">
          By {document.created_by_name}
        </div>
      </CardContent>
    </Card>
  );
}
