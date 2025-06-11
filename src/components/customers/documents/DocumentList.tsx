
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerDocument, DocumentCategory } from '@/types/document';
import { deleteDocument, downloadDocument } from '@/services/documentService';
import { Download, Trash2, Eye, FileText, Image, Link, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatFileSize } from '@/utils/formatters';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getDocumentIcon = (type: string) => {
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

  const handleDelete = async (documentId: string) => {
    try {
      setDeletingId(documentId);
      await deleteDocument(documentId);
      onDocumentDeleted(documentId);
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (document: CustomerDocument) => {
    try {
      if (document.file_url) {
        // For documents with file_url, open in new tab
        window.open(document.file_url, '_blank');
      } else if (document.file_path) {
        // For documents stored in Supabase storage
        const blob = await downloadDocument(document.id);
        const url = URL.createObjectURL(blob);
        const a = document.title;
        const link = document.description;
        
        const downloadLink = document.file_path;
        downloadLink.href = url;
        downloadLink.download = document.title || 'document';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No documents found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getDocumentIcon(document.document_type)}
                <CardTitle className="text-lg">{document.title}</CardTitle>
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
                {document.file_path && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={deletingId === document.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the document "{document.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(document.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {document.description && (
              <p className="text-gray-600 mb-2">{document.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Type: {document.document_type}</span>
                {document.file_size && (
                  <span>Size: {formatFileSize(document.file_size)}</span>
                )}
                <span>Created: {formatDate(document.created_at)}</span>
                <span>By: {document.created_by_name}</span>
              </div>
            </div>
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
