import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDocumentCategories } from '@/hooks/useDocumentCategories';
import { DocumentService } from '@/services/documentService';
import { CreateDocumentData } from '@/types/document';
import { Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentCreated: (documentData: CreateDocumentData) => Promise<void>;
  workOrderId?: string;
  customerId?: string;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onDocumentCreated,
  workOrderId,
  customerId,
}: DocumentUploadDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [documentType, setDocumentType] = useState<'pdf' | 'image' | 'weblink' | 'internal_link'>('pdf');
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [webUrl, setWebUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { categories } = useDocumentCategories();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      // Auto-detect document type
      if (selectedFile.type.includes('pdf')) {
        setDocumentType('pdf');
      } else if (selectedFile.type.includes('image')) {
        setDocumentType('image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (documentType !== 'weblink' && documentType !== 'internal_link' && !file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = '';
      let filePath = '';
      let fileSize = 0;
      let mimeType = '';

      if (file && (documentType === 'pdf' || documentType === 'image')) {
        fileUrl = await DocumentService.uploadFile(file, `uploads/${Date.now()}_${file.name}`);
        filePath = `uploads/${Date.now()}_${file.name}`;
        fileSize = file.size;
        mimeType = file.type;
      } else if (documentType === 'weblink') {
        fileUrl = webUrl;
      }

      const documentData: CreateDocumentData = {
        title: title.trim(),
        description: description.trim() || undefined,
        document_type: documentType,
        file_path: filePath || undefined,
        file_url: fileUrl || undefined,
        file_size: fileSize || undefined,
        mime_type: mimeType || undefined,
        category_id: categoryId || undefined,
        work_order_id: workOrderId,
        customer_id: customerId,
        is_public: isPublic,
        created_by: 'current-user-id', // TODO: Get from auth context
        created_by_name: 'Current User', // TODO: Get from auth context
      };

      await onDocumentCreated(documentData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setDocumentType('pdf');
      setIsPublic(false);
      setFile(null);
      setWebUrl('');
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="weblink">Web Link</SelectItem>
                <SelectItem value="internal_link">Internal Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(documentType === 'pdf' || documentType === 'image') && (
            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={documentType === 'pdf' ? '.pdf' : 'image/*'}
                required
              />
            </div>
          )}

          {documentType === 'weblink' && (
            <div>
              <Label htmlFor="web-url">Web URL</Label>
              <Input
                id="web-url"
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="is-public">Make this document public</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
