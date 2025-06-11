import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerDocument } from '@/types/document';
import { getDocumentDownloadUrl, deleteDocument } from '@/services/documentService';
import { Download, Eye, Trash2, FileText, Image, Link, ExternalLink } from 'lucide-react';
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
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null);
  const { toast } = useToast();

  const handleDownload = async (document: CustomerDocument) => {
    try {
      const url = await getDocumentDownloadUrl(document.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download failed",
        description: "Could not download the document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document: CustomerDocument) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(document.id);
        onDocumentDeleted(document.id); // Pass the ID string, not the whole document
        toast({
          title: "Document deleted",
          description: "The document has been deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Delete failed",
          description: "Could not delete the document",
          variant: "destructive",
        });
      }
    }
  };

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

  const handleVersionUpload = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setIsVersionDialogOpen(true);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          No documents have been uploaded for this customer yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {documents.map((document) => (
          <Card key={document.id}>
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
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Uploaded by {document.created_by_name} on {new Date(document.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
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
                    onClick={() => handleVersionUpload(document)}
                  >
                    Upload Version
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDocument && (
        <DocumentVersionDialog
          document={selectedDocument}
          open={isVersionDialogOpen}
          onOpenChange={setIsVersionDialogOpen}
          onVersionUploaded={onDocumentUpdated}
        />
      )}
    </>
  );
};
