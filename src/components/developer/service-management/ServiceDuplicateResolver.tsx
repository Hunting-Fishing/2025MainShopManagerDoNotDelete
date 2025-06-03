
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportPreviewData, DuplicateResolution } from '@/hooks/useServiceStagedImport';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ServiceDuplicateResolverProps {
  previewData: ImportPreviewData;
  resolutions: DuplicateResolution[];
  onResolutionsChange: (resolutions: DuplicateResolution[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ServiceDuplicateResolver: React.FC<ServiceDuplicateResolverProps> = ({
  previewData,
  resolutions,
  onResolutionsChange,
  onNext,
  onBack
}) => {
  const { duplicateCategories, duplicateSubcategories, duplicateJobs } = previewData;
  
  const allDuplicates = [
    ...duplicateCategories.map(name => ({ type: 'category' as const, name })),
    ...duplicateSubcategories.map(name => ({ type: 'subcategory' as const, name })),
    ...duplicateJobs.map(name => ({ type: 'job' as const, name }))
  ];

  const getResolution = (type: string, name: string) => {
    return resolutions.find(r => r.type === type && r.name === name);
  };

  const updateResolution = (type: string, name: string, action: 'skip' | 'replace' | 'rename', newName?: string) => {
    const newResolutions = resolutions.filter(r => !(r.type === type && r.name === name));
    newResolutions.push({
      id: crypto.randomUUID(),
      type: type as 'category' | 'subcategory' | 'job',
      name,
      action,
      newName
    });
    onResolutionsChange(newResolutions);
  };

  const setAllAction = (action: 'skip' | 'replace' | 'rename') => {
    const newResolutions = allDuplicates.map(duplicate => ({
      id: crypto.randomUUID(),
      type: duplicate.type,
      name: duplicate.name,
      action,
      newName: action === 'rename' ? `${duplicate.name} (Imported)` : undefined
    }));
    onResolutionsChange(newResolutions);
  };

  const isResolutionComplete = allDuplicates.every(duplicate => 
    getResolution(duplicate.type, duplicate.name)
  );

  if (allDuplicates.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Duplicates Found</h3>
        <p className="text-gray-600 mb-4">
          All data appears to be unique. You can proceed with the import.
        </p>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Preview
          </Button>
          <Button onClick={onNext}>
            Start Import
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Resolve Duplicates ({allDuplicates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="text-sm font-medium">Quick Actions:</Label>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setAllAction('skip')}>
                Skip All Duplicates
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAllAction('replace')}>
                Replace All Existing
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAllAction('rename')}>
                Rename All New Items
              </Button>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {allDuplicates.map((duplicate, index) => {
                const resolution = getResolution(duplicate.type, duplicate.name);
                
                return (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {duplicate.type.charAt(0).toUpperCase() + duplicate.type.slice(1)}
                            </Badge>
                            <span className="font-medium">{duplicate.name}</span>
                          </div>
                        </div>
                        {resolution && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>

                      <RadioGroup
                        value={resolution?.action || ''}
                        onValueChange={(value) => 
                          updateResolution(duplicate.type, duplicate.name, value as any)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skip" id={`skip-${index}`} />
                          <Label htmlFor={`skip-${index}`} className="text-sm">
                            Skip - Don't import this item
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="replace" id={`replace-${index}`} />
                          <Label htmlFor={`replace-${index}`} className="text-sm">
                            Replace - Overwrite the existing item
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rename" id={`rename-${index}`} />
                          <Label htmlFor={`rename-${index}`} className="text-sm">
                            Rename - Import with a different name
                          </Label>
                        </div>
                      </RadioGroup>

                      {resolution?.action === 'rename' && (
                        <div className="mt-3">
                          <Label htmlFor={`newname-${index}`} className="text-sm">New Name:</Label>
                          <Input
                            id={`newname-${index}`}
                            value={resolution.newName || ''}
                            onChange={(e) => 
                              updateResolution(duplicate.type, duplicate.name, 'rename', e.target.value)
                            }
                            placeholder={`${duplicate.name} (Imported)`}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Preview
        </Button>
        <Button onClick={onNext} disabled={!isResolutionComplete}>
          Start Import
        </Button>
      </div>
    </div>
  );
};
