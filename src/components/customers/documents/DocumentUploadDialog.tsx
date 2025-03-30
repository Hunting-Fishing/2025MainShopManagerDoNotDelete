
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { CustomerDocument, DocumentCategory } from '@/types/document';
import { uploadDocument } from '@/services/documentService';
import { TagInput } from '@/components/customers/documents/TagInput';

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
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      
      // Use filename as default title if title is empty
      if (!title) {
        const filename = e.target.files[0].name;
        // Remove file extension
        const titleFromFilename = filename.split('.').slice(0, -1).join('.');
        setTitle(titleFromFilename);
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
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please provide a title for the document",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const result = await uploadDocument({
        file,
        customerId,
        title,
        description,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isShared,
        versionNotes: versionNotes || undefined
      });
      
      if (result) {
        toast({
          title: "Document uploaded",
          description: "The document was uploaded successfully",
        });
        
        onDocumentUploaded(result);
        resetForm();
        onOpenChange(false);
      } else {
        throw new Error("Failed to upload document");
      }
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
    setCategory('');
    setTags([]);
    setIsShared(false);
    setVersionNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to the customer's profile
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={handleFileChange} 
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
                placeholder="Brief description of the document"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags..."
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isShared"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
              <Label htmlFor="isShared">
                Share with customer
              </Label>
            </div>
            
            <div>
              <Label htmlFor="versionNotes">Version Notes</Label>
              <Textarea
                id="versionNotes"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className="mt-1"
                placeholder="Notes about this version"
              />
            </div>
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
