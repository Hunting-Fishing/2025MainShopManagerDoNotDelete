
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerDocument, DocumentCategory, CreateDocumentData } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getDocumentType = (fileName: string): 'pdf' | 'image' | 'weblink' | 'internal_link' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) return 'image';
    return 'pdf'; // default
  };

  const handleUpload = async () => {
    if (!file || !title) {
      toast({
        title: "Error",
        description: "Please provide a title and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file first
      const { path, url } = await DocumentService.uploadFile(file, 'customer-documents');

      // Create document record
      const documentData: CreateDocumentData = {
        title,
        description: description || undefined,
        document_type: getDocumentType(file.name),
        file_path: path,
        file_url: url,
        file_size: file.size,
        mime_type: file.type,
        category_id: categoryId || undefined,
        customer_id: customerId,
        is_public: false,
        metadata: {},
        tags: [],
        created_by: 'current_user_id', // This should come from auth
        created_by_name: 'Current User' // This should come from auth
      };

      const newDocument = await DocumentService.createDocument(documentData);
      
      onDocumentUploaded(newDocument as CustomerDocument);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setFile(null);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
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
          
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
