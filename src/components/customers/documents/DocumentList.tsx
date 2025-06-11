
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomerDocument } from '@/types/document';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  ExternalLink, 
  Link, 
  Download, 
  Eye, 
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getDocumentDownloadUrl, deleteDocument } from '@/services/documentService';
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
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const { toast } = useToast();

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'weblink':
        return <ExternalLink className="h-5 w-5" />;
      case 'internal_link':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleDownload = async (document: CustomerDocument) => {
    try {
      const url = await getDocumentDownloadUrl(document);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the document",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (document: CustomerDocument) => {
    try {
      if (document.file_url) {
        window.open(document.file_url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Could not preview the document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document: CustomerDocument) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(document.id);
        onDocumentDeleted(document.id);
        toast({
          title: "Document deleted",
          description: "The document has been successfully deleted",
        });
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "Could not delete the document",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewVersion = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setIsVersionDialogOpen(true);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-500">Upload your first document to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getDocumentIcon(document.document_type)}
                  <CardTitle className="text-sm font-medium truncate">
                    {document.title}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePreview(document)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(document)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNewVersion(document)}>
                      <Edit className="mr-2 h-4 w-4" />
                      New Version
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(document)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {document.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {document.document_type.toUpperCase()}
                </Badge>
                {document.category_name && (
                  <Badge variant="outline" className="text-xs">
                    {document.category_name}
                  </Badge>
                )}
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {document.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.tags.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Created {new Date(document.created_at).toLocaleDateString()}
                {document.created_by_name && (
                  <span> by {document.created_by_name}</span>
                )}
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
          onVersionUploaded={() => {
            onDocumentUpdated();
            setIsVersionDialogOpen(false);
          }}
        />
      )}
    </>
  );
};
