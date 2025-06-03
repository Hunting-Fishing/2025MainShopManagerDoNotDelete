
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { ImportPreviewData, DuplicateResolution } from '@/hooks/useServiceStagedImport';

interface ServiceDuplicateResolverProps {
  duplicates: ImportPreviewData['duplicates'];
  resolutions: Record<string, 'skip' | 'replace' | 'rename'>;
  onUpdateResolution: (categoryId: string, action: 'skip' | 'replace' | 'rename') => void;
  onBack: () => void;
  onProceed: () => void;
}

export const ServiceDuplicateResolver: React.FC<ServiceDuplicateResolverProps> = ({
  duplicates,
  resolutions,
  onUpdateResolution,
  onBack,
  onProceed
}) => {
  const [newNames, setNewNames] = React.useState<Record<string, string>>({});

  // Combine all duplicates from different sources
  const allDuplicates = [
    ...duplicates,
    // Add mock duplicates for demonstration if none exist
  ];

  const handleActionChange = (duplicateId: string, action: 'skip' | 'replace' | 'rename') => {
    onUpdateResolution(duplicateId, action);
  };

  const handleNameChange = (duplicateId: string, newName: string) => {
    setNewNames(prev => ({ ...prev, [duplicateId]: newName }));
  };

  const handleProceed = () => {
    // Convert resolutions to the expected format
    const resolvedDuplicates: DuplicateResolution[] = Object.entries(resolutions).map(([categoryId, action]) => ({
      categoryId,
      action,
      newName: newNames[categoryId],
      id: crypto.randomUUID(),
      type: 'category',
      name: 'Unknown'
    }));

    // Call the original proceed function
    onProceed();
  };

  const allResolved = allDuplicates.every(duplicate => 
    resolutions[duplicate.existing.id] || resolutions[duplicate.imported.id]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Resolve Duplicates
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleProceed} disabled={!allResolved}>
            Proceed with Import
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {allDuplicates.map((duplicate, index) => {
          const duplicateId = duplicate.existing.id;
          const currentAction = resolutions[duplicateId];
          
          return (
            <Card key={index} className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-base">{duplicate.imported.name}</span>
                  <Badge variant="secondary">Duplicate Found</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Existing Item</h4>
                    <div className="bg-green-50 p-3 rounded border">
                      <p className="font-medium">{duplicate.existing.name}</p>
                      <p className="text-sm text-gray-600">
                        {duplicate.existing.subcategories?.length || 0} subcategories
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Imported Item</h4>
                    <div className="bg-blue-50 p-3 rounded border">
                      <p className="font-medium">{duplicate.imported.name}</p>
                      <p className="text-sm text-gray-600">
                        {duplicate.imported.subcategories?.length || 0} subcategories
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Choose Action:</h4>
                  <Select
                    value={currentAction || ''}
                    onValueChange={(value: 'skip' | 'replace' | 'rename') => 
                      handleActionChange(duplicateId, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip - Keep existing item</SelectItem>
                      <SelectItem value="replace">Replace - Use imported item</SelectItem>
                      <SelectItem value="rename">Rename - Import with new name</SelectItem>
                    </SelectContent>
                  </Select>

                  {currentAction === 'rename' && (
                    <Input
                      placeholder="Enter new name..."
                      value={newNames[duplicateId] || ''}
                      onChange={(e) => handleNameChange(duplicateId, e.target.value)}
                    />
                  )}
                </div>

                {duplicate.conflicts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Conflicts:</h4>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {duplicate.conflicts.map((conflict, i) => (
                        <li key={i}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allDuplicates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No duplicates found. Ready to proceed with import.
        </div>
      )}
    </div>
  );
};
