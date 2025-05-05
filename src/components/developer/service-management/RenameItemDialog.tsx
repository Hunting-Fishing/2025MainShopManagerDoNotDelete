
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface RenameItemDialogProps {
  currentName: string;
  itemType: 'category' | 'subcategory' | 'job';
  onSave: (newName: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RenameItemDialog: React.FC<RenameItemDialogProps> = ({
  currentName,
  itemType,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [newName, setNewName] = useState(currentName);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newName.trim() === '') {
      toast.error(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} name cannot be empty`);
      return;
    }

    if (newName === currentName) {
      onCancel();
      return;
    }

    setLocalLoading(true);
    try {
      await onSave(newName);
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} renamed successfully`);
    } catch (error) {
      console.error(`Error renaming ${itemType}:`, error);
      toast.error(`Failed to rename ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const itemTypeLabel = {
    category: 'Category',
    subcategory: 'Subcategory',
    job: 'Service'
  }[itemType];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-3">Rename {itemTypeLabel}</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="itemName">Name</Label>
            <Input
              id="itemName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Enter ${itemType} name`}
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading || localLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || localLoading || newName === currentName || !newName.trim()}
            >
              {isLoading || localLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
