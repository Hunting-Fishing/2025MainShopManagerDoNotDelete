
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { Download, Eye, FileText, Image, Link, ExternalLink } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
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

  const handleView = () => {
    if (onView) {
      onView(document);
    }
    // Log the access with proper parameters
    DocumentService.logAccess(
      document.id, 
      'view', 
      'current_user_id', 
      'Current User'
    );
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    }
    // Log the access with proper parameters  
    DocumentService.logAccess(
      document.id, 
      'download', 
      'current_user_id', 
      'Current User'
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIconForType(document.document_type)}
            <CardTitle className="text-sm">{document.title}</CardTitle>
          </div>
          <Badge variant="outline">
            {document.document_type.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {document.description && (
          <p className="text-sm text-gray-600 mb-3">{document.description}</p>
        )}
        
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created by {document.created_by_name} on {new Date(document.created_at).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
