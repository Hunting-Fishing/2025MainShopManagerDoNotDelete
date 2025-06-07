import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceJob } from '@/types/service';
import { AlertTriangle, Merge, Trash2, Edit } from 'lucide-react';

interface DuplicateResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  primaryService: ServiceJob;
  duplicateService: ServiceJob;
  onMerge: (primaryServiceId: string, duplicateServiceId: string, newDescription: string) => void;
  onDelete: (serviceId: string) => void;
  onEdit: (serviceId: string, field: string, value: string | number) => void;
}

export function DuplicateResolutionDialog({
  isOpen,
  onClose,
  primaryService,
  duplicateService,
  onMerge,
  onDelete,
  onEdit
}: DuplicateResolutionDialogProps) {
  const [mergeDescription, setMergeDescription] = useState(primaryService.description || '');
  const [selectedPrimary, setSelectedPrimary] = useState<'primary' | 'duplicate'>('primary');

  const handleMerge = () => {
    onMerge(primaryService.id, duplicateService.id, mergeDescription);
    onClose();
  };

  const handleDelete = (serviceId: string) => {
    onDelete(serviceId);
    onClose();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMergeDescription(e.target.value);
  };

  const handlePrimarySelect = (value: 'primary' | 'duplicate') => {
    setSelectedPrimary(value);
    if (value === 'primary') {
      setMergeDescription(primaryService.description || '');
    } else {
      setMergeDescription(duplicateService.description || '');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Duplicate Service Resolution
          </DialogTitle>
          <DialogDescription>
            Resolve duplicate service entries by merging or deleting one of the duplicates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Service */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Primary Service</h4>
              <Badge variant="secondary">{primaryService.id}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="primary-name">Name:</Label>
                <input
                  type="text"
                  id="primary-name"
                  value={primaryService.name}
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                  readOnly
                />
              </div>
              <div className="flex items-start gap-2">
                <Label htmlFor="primary-description">Description:</Label>
                <Textarea
                  id="primary-description"
                  value={primaryService.description || ''}
                  onChange={(e) => handleEdit(primaryService.id, 'description', e.target.value)}
                  placeholder="No description provided"
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="primary-price">Price:</Label>
                <input
                  type="number"
                  id="primary-price"
                  value={primaryService.price || 0}
                  onChange={(e) => handleEdit(primaryService.id, 'price', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="primary-time">Estimated Time:</Label>
                <input
                  type="number"
                  id="primary-time"
                  value={primaryService.estimatedTime || 0}
                  onChange={(e) => handleEdit(primaryService.id, 'estimatedTime', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Duplicate Service */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Duplicate Service</h4>
              <Badge variant="secondary">{duplicateService.id}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="duplicate-name">Name:</Label>
                <input
                  type="text"
                  id="duplicate-name"
                  value={duplicateService.name}
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                  readOnly
                />
              </div>
              <div className="flex items-start gap-2">
                <Label htmlFor="duplicate-description">Description:</Label>
                <Textarea
                  id="duplicate-description"
                  value={duplicateService.description || ''}
                  onChange={(e) => handleEdit(duplicateService.id, 'description', e.target.value)}
                  placeholder="No description provided"
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="duplicate-price">Price:</Label>
                <input
                  type="number"
                  id="duplicate-price"
                  value={duplicateService.price || 0}
                  onChange={(e) => handleEdit(duplicateService.id, 'price', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="duplicate-time">Estimated Time:</Label>
                <input
                  type="number"
                  id="duplicate-time"
                  value={duplicateService.estimatedTime || 0}
                  onChange={(e) => handleEdit(duplicateService.id, 'estimatedTime', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded-md bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Merge Options */}
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-3">Merge Options</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="primary">
                <input
                  type="radio"
                  id="primary"
                  name="merge-source"
                  value="primary"
                  checked={selectedPrimary === 'primary'}
                  onChange={() => handlePrimarySelect('primary')}
                  className="mr-2"
                />
                Use Primary Service Description
              </Label>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(primaryService.id, 'description', mergeDescription)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="duplicate">
                <input
                  type="radio"
                  id="duplicate"
                  name="merge-source"
                  value="duplicate"
                  checked={selectedPrimary === 'duplicate'}
                  onChange={() => handlePrimarySelect('duplicate')}
                  className="mr-2"
                />
                Use Duplicate Service Description
              </Label>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(duplicateService.id, 'description', mergeDescription)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor="merged-description">Merged Description:</Label>
              <Textarea
                id="merged-description"
                value={mergeDescription}
                onChange={handleDescriptionChange}
                className="w-full px-2 py-1 border rounded-md text-sm"
                placeholder="Enter a new merged description..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleDelete(duplicateService.id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Duplicate
          </Button>
          <Button
            type="button"
            className="flex items-center gap-2"
            onClick={handleMerge}
          >
            <Merge className="h-4 w-4" />
            Merge Services
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function handleEdit(serviceId: string, field: string, value: string | number | null) {
    if (value !== null) {
      onEdit(serviceId, field, value);
    }
  }
}
