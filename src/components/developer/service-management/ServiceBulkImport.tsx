
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Upload, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { bulkImportServiceCategories } from '@/lib/services/serviceApi';

interface ServiceBulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setProgress(0);
    setError(null);

    try {
      // Read the file as text
      const text = await file.text();
      
      // Parse the JSON
      let parsedData: ServiceMainCategory[];
      try {
        parsedData = JSON.parse(text);
        
        // Validate the structure (basic validation)
        if (!Array.isArray(parsedData)) {
          throw new Error('Invalid format: Expected an array of categories');
        }
        
      } catch (err) {
        throw new Error('Invalid JSON format');
      }

      // Import the data
      await bulkImportServiceCategories(parsedData, (progress) => {
        setProgress(Math.round(progress * 100));
      });

      // Success
      toast({
        title: "Import successful",
        description: `Imported ${parsedData.length} service categories`,
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      onImportComplete();
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Service Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">JSON File</Label>
            <Input
              id="file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              Upload a JSON file with service categories structure
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm flex items-start">
              <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={importing || !file}>
            {importing ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBulkImport;
