
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DocumentService } from '@/services/documentService';
import { CustomerDocument, DocumentCategory } from '@/types/document';

interface DocumentUploadDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentUploaded: (document: CustomerDocument) => void;
  categories: DocumentCategory[];
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  customerId,
  open,
  onOpenChange,
  onDocumentUploaded,
  categories
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the document",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file and get path/URL
      const { path, url } = await DocumentService.uploadFile(file, 'customer-documents');
      
      // Create document record
      const documentData = {
        title: title.trim(),
        description: description.trim() || undefined,
        document_type: getDocumentType(file),
        file_path: path,
        file_url: url,
        file_size: file.size,
        mime_type: file.type,
        category_id: categoryId || undefined,
        customer_id: customerId,
        is_public: false,
        metadata: {},
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        created_by: 'current_user_id', // This should come from auth context
        created_by_name: 'Current User' // This should come from auth context
      };
      
      const newDocument = await DocumentService.createDocument(documentData);
      
      toast({
        title: "Document uploaded",
        description: "The document was uploaded successfully",
      });
      
      onDocumentUploaded({ ...newDocument, customer_id: customerId });
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

  const getDocumentType = (file: File): 'pdf' | 'image' | 'weblink' | 'internal_link' => {
    const mimeType = file.type.toLowerCase();
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    return 'pdf'; // Default fallback
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategoryId('');
    setTags('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document for this customer
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
              className="mt-1"
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
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder="Optional description"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category (optional)" />
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
