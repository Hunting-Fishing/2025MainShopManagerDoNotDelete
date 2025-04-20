
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { WorkOrderSignature } from './WorkOrderSignature';
import { FileUploader } from './FileUploader';
import { DocumentList } from './DocumentList';
import { uploadWorkOrderDocument, getWorkOrderDocuments } from '@/services/documentService';

interface WorkOrderDocumentManagerProps {
  workOrderId: string;
}

export function WorkOrderDocumentManager({ workOrderId }: WorkOrderDocumentManagerProps) {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [workOrderId]);

  const loadDocuments = async () => {
    try {
      const docs = await getWorkOrderDocuments(workOrderId);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        await uploadWorkOrderDocument(workOrderId, file);
      }
      loadDocuments();
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents & Signatures</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
              }}
            />
            <DocumentList documents={documents} />
          </TabsContent>
          
          <TabsContent value="signatures">
            <WorkOrderSignature workOrderId={workOrderId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
