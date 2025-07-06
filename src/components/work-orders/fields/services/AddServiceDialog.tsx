import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategoryId: string;
  subcategoryName: string;
  categoryName: string;
  onSuccess: () => void;
}

export const AddServiceDialog: React.FC<AddServiceDialogProps> = ({
  open,
  onOpenChange,
  subcategoryId,
  subcategoryName,
  categoryName,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('insert_service_job', {
        p_subcategory_id: subcategoryId,
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_estimated_time: estimatedTime ? parseInt(estimatedTime) : null,
        p_price: price ? parseFloat(price) : null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service created successfully"
      });

      // Reset form
      setName('');
      setDescription('');
      setEstimatedTime('');
      setPrice('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <div className="text-sm text-muted-foreground">
            <div>Category: <span className="font-medium">{categoryName}</span></div>
            <div>Subcategory: <span className="font-medium">{subcategoryName}</span></div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">Service Name *</Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Replace Brake Pads, Control Arm Replacement"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the service"
              disabled={isLoading}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
              <Input
                id="estimated-time"
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="60"
                disabled={isLoading}
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="100.00"
                disabled={isLoading}
                min="0"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};