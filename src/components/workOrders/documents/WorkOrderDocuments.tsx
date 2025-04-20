
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileIcon, UploadIcon, DownloadIcon, Clock, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentVersionDialog } from "./DocumentVersionDialog";

interface WorkOrderDocumentsProps {
  workOrderId: string;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  category?: string;
  description?: string;
  uploaded_at: string;
  version_count: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  file_url: string;
  version_number: number;
  notes?: string;
  created_at: string;
}

export function WorkOrderDocuments({ workOrderId }: WorkOrderDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [workOrderId]);
  
  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('work_order_documents')
        .select('*')
        .eq('work_order_id', workOrderId);
        
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('work_order_document_categories')
        .select('*');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Get the file extension to determine file type
      const fileExtension = file.name.split('.').pop() || '';
      const fileType = file.type || `application/${fileExtension}`;
      
      // Upload file to storage
      const fileName = `${workOrderId}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('work-order-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('work-order-files')
        .getPublicUrl(fileName);

      // Create document record
      const { error: docError } = await supabase
        .from('work_order_documents')
        .insert({
          work_order_id: workOrderId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: fileType,
          description: description,
          category_id: category || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (docError) throw docError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      fetchDocuments();
      setShowUploadDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setDescription('');
    setCategory('');
  };
  
  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setShowPreviewDialog(true);
  };
  
  const fetchVersions = async (documentId: string) => {
    setSelectedDocument(documentId);
    try {
      const { data, error } = await supabase
        .from('work_order_document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });
        
      if (error) throw error;
      setDocumentVersions(data || []);
      setShowVersionsDialog(true);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: "Error",
        description: "Failed to load document versions",
        variant: "destructive",
      });
    }
  };
  
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const found = categories.find(c => c.id === categoryId);
    return found ? found.name : 'Uncategorized';
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📁';
  };
  
  const handleVersionUpload = () => {
    if (!selectedDocument) return;
    setShowVersionsDialog(false);
    setShowVersionDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button onClick={() => setShowUploadDialog(true)} size="sm">
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-10">
            <FileIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setShowUploadDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Versions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-2">{getFileIcon(doc.file_type)}</span>
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(doc.category)}</TableCell>
                  <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => fetchVersions(doc.id)}
                      className="px-2"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {doc.version_count || 1}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(doc.file_url)}
                        title="Preview"
                      >
                        👁️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        title="Download"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter document description..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            
            <div className="w-full h-[500px] overflow-auto border rounded">
              {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={previewUrl} alt="Document Preview" className="max-w-full" />
              ) : previewUrl.match(/\.(pdf)$/i) ? (
                <iframe src={previewUrl} width="100%" height="500px" title="PDF Preview"></iframe>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2">Preview not available</p>
                    <Button className="mt-4" onClick={() => window.open(previewUrl, '_blank')}>
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Versions Dialog */}
        <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Document Versions</DialogTitle>
            </DialogHeader>
            
            <div>
              <Button onClick={handleVersionUpload} size="sm" className="mb-4">
                <Plus className="mr-2 h-4 w-4" />
                Upload New Version
              </Button>
              
              {documentVersions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentVersions.map(version => (
                      <TableRow key={version.id}>
                        <TableCell>v{version.version_number}</TableCell>
                        <TableCell>{new Date(version.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{version.notes || 'No notes'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(version.file_url, '_blank')}
                            title="Download"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-gray-500">No version history available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Document Version Upload Dialog */}
        {selectedDocument && (
          <DocumentVersionDialog
            documentId={selectedDocument}
            open={showVersionDialog}
            onOpenChange={setShowVersionDialog}
            onVersionUploaded={() => {
              fetchVersions(selectedDocument);
              fetchDocuments(); // Refresh document list to update version count
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
