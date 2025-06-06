
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FolderOpen, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getStorageBucketInfo } from '@/lib/services';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [bucketInfo, setBucketInfo] = useState<{ exists: boolean; files: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStorageBucket = async () => {
      try {
        const info = await getStorageBucketInfo('service-data');
        setBucketInfo(info);
        setLoading(false);
      } catch (error) {
        console.error("Error checking storage bucket:", error);
        setBucketInfo({ exists: false, files: [] });
        setLoading(false);
      }
    };

    checkStorageBucket();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button 
          onClick={onImport} 
          disabled={disabled || loading || !bucketInfo?.exists || bucketInfo.files.length === 0} 
          className="flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Services from Storage
        </Button>
        
        <p className="text-xs text-muted-foreground">
          {loading ? 'Checking storage bucket...' : 
            !bucketInfo?.exists ? 'Storage bucket "service-data" not found' :
            bucketInfo.files.length === 0 ? 'No files found in storage bucket' :
            `Found ${bucketInfo.files.length} file(s) ready for import`}
        </p>
      </div>

      {!loading && !bucketInfo?.exists && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please ensure the "service-data" bucket exists in your Supabase storage and contains Excel files.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
