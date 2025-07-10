
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { Download, Eye, FileText, Image, Link, ExternalLink, MoreVertical, Edit, Trash2 } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onClick?: (document: Document) => void;
  onView?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onClick,
  onView,
  onEdit,
  onDelete,
  onDownload
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'weblink':
        return <Link className="h-4 w-4" />;
      case 'internal_link':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleView = async () => {
    try {
      if (document.document_type === 'weblink') {
        // For web links, open URL directly
        if (document.file_url) {
          window.open(document.file_url, '_blank');
        }
      } else if (document.file_path) {
        // For uploaded files, get a fresh signed URL
        const bucketName = document.work_order_id ? 'work-order-documents' : 'documents';
        const signedUrl = await DocumentService.getSignedUrl(document.file_path, bucketName);
        window.open(signedUrl, '_blank');
      }
      
      if (onView) {
        onView(document);
      }
      if (onClick) {
        onClick(document);
      }
      // Log the access
      DocumentService.logAccess(document.id, 'view');
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleDownload = async () => {
    try {
      if (document.document_type === 'weblink') {
        // For web links, just open the URL
        if (document.file_url) {
          window.open(document.file_url, '_blank');
        }
      } else if (document.file_path) {
        // For uploaded files, get a fresh signed URL for download
        const bucketName = document.work_order_id ? 'work-order-documents' : 'documents';
        const signedUrl = await DocumentService.getSignedUrl(document.file_path, bucketName);
        
        // Create download link
        const link = window.document.createElement('a');
        link.href = signedUrl;
        link.download = document.title;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
      
      if (onDownload) {
        onDownload(document);
      }
      // Log the access
      DocumentService.logAccess(document.id, 'download');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(document);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 bg-card border border-border h-full flex flex-col">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">
              {getIconForType(document.document_type)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold line-clamp-2 text-foreground leading-tight">
                {document.title}
              </CardTitle>
              <Badge variant="outline" className="text-xs mt-1 bg-background">
                {document.document_type.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {document.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {document.description}
            </p>
          )}
          
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{document.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground min-w-0">
              <div className="font-medium text-foreground truncate">{document.created_by_name}</div>
              <div>{new Date(document.created_at).toLocaleDateString()}</div>
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="h-8 px-3 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 px-3 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
