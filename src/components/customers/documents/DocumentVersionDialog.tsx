
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CustomerDocument } from '@/types/document';
import { uploadDocumentVersion } from '@/services/documentService';
import { useIsMobile } from '@/hooks/use-mobile';
import { FileText, Upload } from 'lucide-react';

interface UploadVersionResult {
  version_number: number;
}

interface DocumentVersionDialogProps {
  document: CustomerDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionUploaded: () => void;
}

export const DocumentVersionDialog: React.FC<DocumentVersionDialogProps> = ({
  document,
  open,
  onOpenChange,
  onVersionUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

    setIsUploading(true);

    try {
      // Here we cast the awaited result explicitly to UploadVersionResult
      const result = (await uploadDocumentVersion(
        document.id,
        file,
        versionNotes || undefined
      )) as UploadVersionResult;

      if (result) {
        toast({
          title: "New version uploaded",
          description: `Version ${result.version_number} was uploaded successfully`,
        });

        onVersionUploaded();
        resetForm();
        onOpenChange(false);
      } else {
        throw new Error("Failed to upload new version");
      }
    } catch (error) {
      console.error("Error uploading version:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading the new version",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setVersionNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${isMobile ? 'p-4' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload New Version
          </DialogTitle>
          <DialogDescription>
            Upload a new version of "{document.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file" className="block mb-2 font-medium">Select File</Label>
            <div className={`border-2 border-dashed rounded-lg p-4 ${isMobile ? 'p-3' : 'p-4'} text-center cursor-pointer transition-colors hover:border-primary`}>
              <input 
                id="file" 
                type="file" 
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <Label htmlFor="file" className="cursor-pointer text-sm text-muted-foreground">
                  {file ? 'Change file' : 'Click to select a file'}
                </Label>
              </div>
            </div>
            {file && (
              <div className="mt-2 text-sm bg-muted/50 p-2 rounded-md">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {file.type}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="versionNotes" className="block mb-2 font-medium">Version Notes</Label>
            <Textarea
              id="versionNotes"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              placeholder="Describe what's changed in this version"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
            <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'space-x-2'}`}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
                className={isMobile ? 'w-full' : ''}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !file}
                className={isMobile ? 'w-full' : ''}
              >
                {isUploading ? "Uploading..." : "Upload Version"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
