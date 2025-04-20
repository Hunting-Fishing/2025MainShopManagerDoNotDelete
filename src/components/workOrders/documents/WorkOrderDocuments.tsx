
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileUp, Trash2, Eye, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentVersionDialog } from './DocumentVersionDialog';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  category_id?: string;
  version_count: number;
}

interface Category {
  id: string;
  name: string;
}

interface Version {
  id: string;
  file_url: string;
  version_number: number;
  created_at: string;
  notes?: string;
}

export function WorkOrderDocuments({ workOrderId }: { workOrderId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, [workOrderId]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('work_order_document_categories')
      .select('*');
    
    if (error) {
      console.error('Error loading categories:', error);
      return;
    }
    
    setCategories(data || []);
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('work_order_documents')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (documentId: string) => {
    const { data, error } = await supabase
      .from('work_order_document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error loading versions:', error);
      return;
    }

    setVersions(data || []);
    setShowVersions(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${workOrderId}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('work-order-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('work-order-files')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('work_order_documents')
        .insert({
          work_order_id: workOrderId,
          file_name: file.name,
          file_url: publicUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      loadDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (documentId: string, categoryId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_documents')
        .update({ category_id: categoryId })
        .eq('id', documentId);

      if (error) throw error;

      loadDocuments();
    } catch (err) {
      console.error('Error updating category:', err);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <span className="truncate flex-1">{doc.file_name}</span>
            
            <div className="flex items-center gap-4">
              <Select
                value={doc.category_id || ""}
                onValueChange={(value) => handleUpdateCategory(doc.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewUrl(doc.file_url)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDocument(doc.id);
                    loadVersions(doc.id);
                  }}
                >
                  <History className="h-4 w-4" />
                  {doc.version_count > 1 && (
                    <span className="ml-1 text-xs">{doc.version_count}</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDocument(doc.id);
                    setShowVersionDialog(true);
                  }}
                >
                  <FileUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="aspect-video">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="Document preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Version {version.version_number}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(version.created_at).toLocaleDateString()}
                  </div>
                  {version.notes && (
                    <div className="text-sm mt-1">{version.notes}</div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewUrl(version.file_url)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedDocument && (
        <DocumentVersionDialog
          documentId={selectedDocument}
          open={showVersionDialog}
          onOpenChange={setShowVersionDialog}
          onVersionUploaded={loadDocuments}
        />
      )}
    </div>
  );
}
