
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentCategories } from '@/hooks/useDocumentCategories';
import { DocumentService } from '@/services/documentService';
import { CreateDocumentData } from '@/types/document';
import { Upload, Link, FileText, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentCreated: (document: any) => void;
  workOrderId?: string;
  customerId?: string;
}

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  onDocumentCreated, 
  workOrderId, 
  customerId 
}: DocumentUploadDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateDocumentData>>({
    title: '',
    description: '',
    document_type: 'pdf',
    is_public: false,
    tags: [],
    work_order_id: workOrderId,
    customer_id: customerId
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState('');
  
  const { categories } = useDocumentCategories();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect document type
      if (selectedFile.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, document_type: 'image' }));
      } else if (selectedFile.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, document_type: 'pdf' }));
      }
      
      // Set title if not already set
      if (!formData.title) {
        setFormData(prev => ({ 
          ...prev, 
          title: selectedFile.name.replace(/\.[^/.]+$/, '') 
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Please enter a title for the document",
        variant: "destructive",
      });
      return;
    }

    if (formData.document_type !== 'weblink' && formData.document_type !== 'internal_link' && !file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if ((formData.document_type === 'weblink' || formData.document_type === 'internal_link') && !formData.file_url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      let fileUrl = formData.file_url;
      let filePath = '';
      let fileSize = 0;
      let mimeType = '';

      // Upload file if it's not a link
      if (file && formData.document_type !== 'weblink' && formData.document_type !== 'internal_link') {
        fileUrl = await DocumentService.uploadFile(file, 'documents');
        filePath = fileUrl;
        fileSize = file.size;
        mimeType = file.type;
      }

      const documentData: CreateDocumentData = {
        ...formData,
        file_url: fileUrl,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      } as CreateDocumentData;

      const newDocument = await DocumentService.createDocument(documentData);
      
      onDocumentCreated(newDocument);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        document_type: 'pdf',
        is_public: false,
        tags: [],
        work_order_id: workOrderId,
        customer_id: customerId
      });
      setFile(null);
      setTags('');
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getUploadIcon = () => {
    switch (formData.document_type) {
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'weblink':
      case 'internal_link':
        return <Link className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="document_type">Type</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="weblink">Web Link</SelectItem>
                  <SelectItem value="internal_link">Internal Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter document description"
              rows={3}
            />
          </div>

          {(formData.document_type === 'weblink' || formData.document_type === 'internal_link') ? (
            <div>
              <Label htmlFor="file_url">URL *</Label>
              <Input
                id="file_url"
                type="url"
                value={formData.file_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://example.com/document"
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="file">File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center">
                  {getUploadIcon()}
                  <div className="mt-2">
                    <label htmlFor="file" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Choose file
                      </span>
                      <input
                        id="file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept={formData.document_type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                      />
                    </label>
                  </div>
                  {file && (
                    <p className="text-sm text-gray-500 mt-1">
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
            />
            <Label htmlFor="is_public">Make this document public</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
