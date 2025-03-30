
import React, { useState } from 'react';
import { CustomerDocument } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DownloadCloud, Eye, FileText, MoreHorizontal, Pencil, Trash2, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteDocument, getDocumentDownloadUrl, getDocumentPreviewUrl } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';
import { DocumentVersionDialog } from './DocumentVersionDialog';
import { formatDistanceToNow } from 'date-fns';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CustomerDocument | null>(null);
  const { toast } = useToast();

  const handlePreview = async (document: CustomerDocument) => {
    try {
      const url = await getDocumentPreviewUrl(document.file_path);
      if (url) {
        setPreviewUrl(url);
        setPreviewTitle(document.title);
        setIsPreviewOpen(true);
      } else {
        throw new Error("Could not generate preview URL");
      }
    } catch (error) {
      console.error("Error previewing document:", error);
      toast({
        title: "Preview unavailable",
        description: "Could not generate a preview for this document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: CustomerDocument) => {
    try {
      const url = await getDocumentDownloadUrl(document.file_path);
      if (url) {
        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = document.original_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        throw new Error("Could not generate download URL");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download failed",
        description: "Could not download the document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document: CustomerDocument) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      try {
        const success = await deleteDocument(document.id);
        if (success) {
          toast({
            title: "Document deleted",
            description: "The document was deleted successfully",
          });
          onDocumentDeleted(document.id);
        } else {
          throw new Error("Failed to delete document");
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({
          title: "Delete failed",
          description: "Could not delete the document",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadVersion = (document: CustomerDocument) => {
    setSelectedDocument(document);
    setIsVersionDialogOpen(true);
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <img 
        src="/placeholder.svg" 
        alt="Document thumbnail" 
        className="h-10 w-10 object-cover rounded" 
      />;
    }
    
    return <FileText className="h-10 w-10 text-blue-500" />;
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  const getFormattedSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          This customer doesn't have any documents yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0">
              {getDocumentIcon(doc.file_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {doc.title}
              </h4>
              
              <div className="mt-1 flex flex-wrap gap-2 items-center text-xs text-gray-500">
                <span>{doc.file_type.split('/')[1]?.toUpperCase() || doc.file_type}</span>
                <span>•</span>
                <span>{getFormattedSize(doc.file_size)}</span>
                <span>•</span>
                <span>v{doc.version}</span>
                <span>•</span>
                <span>{getFormattedDate(doc.created_at)}</span>
                
                {doc.is_shared && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">Shared</Badge>
                  </>
                )}
                
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {doc.description && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {doc.description}
                </p>
              )}
            </div>
            
            <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handlePreview(doc)}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDownload(doc)}
                title="Download"
              >
                <DownloadCloud className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUploadVersion(doc)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Version
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(doc)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
      
      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {previewUrl && (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0" 
                title={previewTitle}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Document Version Upload Dialog */}
      {selectedDocument && (
        <DocumentVersionDialog
          document={selectedDocument}
          open={isVersionDialogOpen}
          onOpenChange={setIsVersionDialogOpen}
          onVersionUploaded={onDocumentUpdated}
        />
      )}
    </div>
  );
};
