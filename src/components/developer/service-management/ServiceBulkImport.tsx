
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={onImport}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {disabled ? 'Importing...' : 'Import Services from Storage'}
      </Button>
      
      <div className="text-sm text-gray-600 flex items-center">
        Automatically processes all Excel files in sector folders
      </div>
    </div>
  );
}
