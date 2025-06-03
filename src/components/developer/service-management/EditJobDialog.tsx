
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceJob } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface EditJobDialogProps {
  isOpen: boolean;
  job: ServiceJob | null;
  onClose: () => void;
  onSave: (jobId: string, updates: Partial<ServiceJob>) => Promise<void>;
}

export const EditJobDialog: React.FC<EditJobDialogProps> = ({
  isOpen,
  job,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(job?.name || '');
  const [description, setDescription] = useState(job?.description || '');
  const [estimatedTime, setEstimatedTime] = useState(job?.estimatedTime?.toString() || '');
  const [price, setPrice] = useState(job?.price?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (job) {
      setName(job.name);
      setDescription(job.description || '');
      setEstimatedTime(job.estimatedTime?.toString() || '');
      setPrice(job.price?.toString() || '');
    }
  }, [job]);

  const handleSave = async () => {
    if (!job || !name.trim()) {
      toast.error('Job name is required');
      return;
    }

    const estimatedTimeNum = estimatedTime ? parseInt(estimatedTime) : undefined;
    const priceNum = price ? parseFloat(price) : undefined;

    if (estimatedTime && (isNaN(estimatedTimeNum!) || estimatedTimeNum! <= 0)) {
      toast.error('Estimated time must be a positive number');
      return;
    }

    if (price && (isNaN(priceNum!) || priceNum! < 0)) {
      toast.error('Price must be a valid number');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(job.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        estimatedTime: estimatedTimeNum,
        price: priceNum
      });
      toast.success('Job updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Job name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job description (optional)"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              min="0"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="Estimated time in minutes"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in dollars"
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
