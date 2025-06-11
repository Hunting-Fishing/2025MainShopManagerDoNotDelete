
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CustomerDocument, DocumentCategory } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { TagInput } from './TagInput';

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
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const getDocumentType = (file: File): 'pdf' | 'image' | 'weblink' | 'internal_link' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'pdf'; // Default fallback
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a title",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file to storage
      const filePath = `customers/${customerId}/${Date.now()}-${file.name}`;
      const { path, url } = await DocumentService.uploadFile(file, filePath);
      
      // Create document record
      const documentData = {
        title,
        description,
        document_type: getDocumentType(file),
        file_path: path,
        file_url: url,
        file_size: file.size,
        mime_type: file.type,
        category_id: categoryId || undefined,
        customer_id: customerId,
        tags,
        created_by: 'current-user', // This should come from auth
        created_by_name: 'Current User', // This should come from auth
      };
      
      const newDocument = await DocumentService.createDocument(documentData);
      
      toast({
        title: "Document uploaded",
        description: "The document was uploaded successfully",
      });
      
      onDocumentUploaded(newDocument as CustomerDocument);
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
    setTags([]);
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
              className="mt-1"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
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
              placeholder="Optional description"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category (optional)" />
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
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              placeholder="Add tags (optional)"
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
            <Button type="submit" disabled={isUploading || !file || !title}>
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
