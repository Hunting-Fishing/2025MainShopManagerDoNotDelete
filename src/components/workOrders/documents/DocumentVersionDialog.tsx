
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentVersionDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionUploaded: () => void;
}

export function DocumentVersionDialog({ documentId, open, onOpenChange, onVersionUploaded }: DocumentVersionDialogProps) {
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [notes, setNotes] = React.useState('');
  
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
      // Upload file to storage
      const fileName = `${documentId}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('work-order-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('work-order-files')
        .getPublicUrl(fileName);

      // Create version record
      const { error: versionError } = await supabase
        .from('work_order_document_versions')
        .insert({
          document_id: documentId,
          file_url: publicUrl,
          version_number: 1, // This will be calculated on the backend
          notes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (versionError) throw versionError;

      toast({
        title: "Success",
        description: "New version uploaded successfully",
      });

      onVersionUploaded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading version:', error);
      toast({
        title: "Error",
        description: "Failed to upload new version",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Version</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Version Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what's changed in this version..."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
