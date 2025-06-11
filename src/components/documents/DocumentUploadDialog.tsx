
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DocumentService } from '@/services/documentService';
import { useDocumentCategories } from '@/hooks/useDocumentCategories';

export interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentUploaded?: (document: any) => void;
  customerId?: string;
  workOrderId?: string;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onDocumentUploaded,
  customerId,
  workOrderId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [documentType, setDocumentType] = useState<'pdf' | 'image' | 'weblink' | 'internal_link'>('pdf');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const { categories } = useDocumentCategories();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-set title to filename if not already set
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
      
      // Auto-detect document type
      const fileType = selectedFile.type;
      if (fileType.includes('pdf')) {
        setDocumentType('pdf');
      } else if (fileType.includes('image')) {
        setDocumentType('image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a file and title",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file first
      const uploadResult = await DocumentService.uploadFile(file, customerId ? 'customer-documents' : 'documents');
      
      // Create document record
      const documentData = {
        title: title.trim(),
        description: description.trim() || undefined,
        document_type: documentType,
        file_path: uploadResult.path,
        file_url: uploadResult.url,
        file_size: file.size,
        mime_type: file.type,
        category_id: categoryId || undefined,
        customer_id: customerId,
        work_order_id: workOrderId,
        is_public: false,
        metadata: {},
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        created_by: 'current-user', // This should come from auth context
        created_by_name: 'Current User' // This should come from auth context
      };
      
      const newDocument = await DocumentService.createDocument(documentData);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      if (onDocumentUploaded) {
        onDocumentUploaded(newDocument);
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading the document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategoryId('');
    setDocumentType('pdf');
    setTags('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to the system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange} 
              className="mt-1"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            {file && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
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
              className="mt-1"
              placeholder="Document description (optional)"
            />
          </div>
          
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="weblink">Web Link</SelectItem>
                <SelectItem value="internal_link">Internal Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {categories.length > 0 && (
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1"
              placeholder="Comma-separated tags (optional)"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !file || !title.trim()}>
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
