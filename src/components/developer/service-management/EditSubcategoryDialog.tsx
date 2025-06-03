
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceSubcategory } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface EditSubcategoryDialogProps {
  isOpen: boolean;
  subcategory: ServiceSubcategory | null;
  onClose: () => void;
  onSave: (subcategoryId: string, updates: Partial<ServiceSubcategory>) => Promise<void>;
}

export const EditSubcategoryDialog: React.FC<EditSubcategoryDialogProps> = ({
  isOpen,
  subcategory,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(subcategory?.name || '');
  const [description, setDescription] = useState(subcategory?.description || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
      setDescription(subcategory.description || '');
    }
  }, [subcategory]);

  const handleSave = async () => {
    if (!subcategory || !name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(subcategory.id, {
        name: name.trim(),
        description: description.trim() || undefined
      });
      toast.success('Subcategory updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast.error('Failed to update subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subcategory</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subcategory name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Subcategory description (optional)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
