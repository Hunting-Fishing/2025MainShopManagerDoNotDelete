
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentService, getDocumentDownloadUrl, deleteDocument } from '@/services/documentService';
import { CustomerDocument } from '@/types/document';
import { Download, Eye, FileText, Image, Link, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentVersionDialog } from './DocumentVersionDialog';

interface DocumentListProps {
  documents: CustomerDocument[];
  onDocumentUpdated: () => void;
  onDocumentDeleted: (documentId: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentUpdated,
  onDocumentDeleted
}) => {
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null);
  const { toast } = useToast();

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

  const handleView = async (document: CustomerDocument) => {
    try {
      if (document.file_path) {
        const downloadUrl = await getDocumentDownloadUrl(document.file_path);
        window.open(downloadUrl, '_blank');
      }
      
      // Log the access
      DocumentService.logAccess(
        document.id,
        'view',
        'current_user_id', // This should come from auth context
        'Current User' // This should come from auth context
      );
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Error",
        description: "Failed to open document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: CustomerDocument) => {
    try {
      if (document.file_path) {
        const downloadUrl = await getDocumentDownloadUrl(document.file_path);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = document.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      // Log the access
      DocumentService.logAccess(
        document.id,
        'download',
        'current_user_id', // This should come from auth context
        'Current User' // This should come from auth context
      );
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleNewVersion = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setVersionDialogOpen(true);
  };

  const handleDelete = async (document: CustomerDocument) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(document.id);
        onDocumentDeleted(document.id);
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-400 mb-4">
          <FileText className="w-12 h-12 mx-auto" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">No documents found</h4>
        <p className="text-gray-500">Upload documents for this customer to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="w-full">
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
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500">
                  Created by {document.created_by_name} on {new Date(document.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(document)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNewVersion(document)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  New Version
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(document)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDocument && (
        <DocumentVersionDialog
          document={selectedDocument}
          open={versionDialogOpen}
          onOpenChange={setVersionDialogOpen}
          onVersionUploaded={() => {
            onDocumentUpdated();
            setVersionDialogOpen(false);
          }}
        />
      )}
    </>
  );
};
