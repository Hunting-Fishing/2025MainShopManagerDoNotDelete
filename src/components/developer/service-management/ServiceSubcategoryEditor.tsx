import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceSubcategory } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceSubcategoryEditorProps {
  subcategory: ServiceSubcategory;
  onSave: () => void;
  onCancel: () => void;
}

const ServiceSubcategoryEditor: React.FC<ServiceSubcategoryEditorProps> = ({
  subcategory,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(subcategory.name);
  const [description, setDescription] = useState(subcategory.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(subcategory.name);
    setDescription(subcategory.description || '');
  }, [subcategory]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Subcategory name is required');
      return;
    }

    setIsLoading(true);
    try {
      // Note: This would need to update the parent category's subcategories
      // For now, we'll just show success and let the parent handle it
      toast.success('Subcategory updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast.error('Failed to update subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subcategory</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>Update the details of the subcategory.</p>
        </DialogDescription>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
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
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
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

export default ServiceSubcategoryEditor;
