
import React, { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Document } from '@/types/document';
import { toast } from '@/hooks/use-toast';

export interface WorkOrderDocumentsProps {
  workOrderId: string;
}

export const WorkOrderDocuments: React.FC<WorkOrderDocumentsProps> = ({ workOrderId }) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const { documents, loading, error, refetch, createDocument, deleteDocument } = useDocuments({
    work_order_id: workOrderId
  });

  const handleDocumentClick = (document: Document) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleEditDocument = (document: Document) => {
    toast({
      title: "Feature Coming Soon",
      description: "Document editing will be available soon.",
    });
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    }
  };

  const handleDocumentCreated = async (documentData: any) => {
    try {
      await createDocument(documentData);
      refetch();
    } catch (error) {
      // Error is handled in the dialog
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Order Documents</h3>
        <Button onClick={() => setUploadDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No documents found</h4>
          <p className="text-gray-500 mb-4">Upload documents related to this work order.</p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload First Document
          </Button>
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          onDocumentClick={handleDocumentClick}
          onEditDocument={handleEditDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onDocumentCreated={handleDocumentCreated}
        workOrderId={workOrderId}
      />
    </div>
  );
};
