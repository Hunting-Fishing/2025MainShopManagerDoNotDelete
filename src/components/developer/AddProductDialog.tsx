import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Plus, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  affiliate_link?: string;
  category_id?: string;
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleSlug: string;
  editProduct?: Product | null;
}

export function AddProductDialog({ 
  open, 
  onOpenChange, 
  moduleSlug,
  editProduct 
}: AddProductDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    affiliateLink: '',
    category: '',
  });

  const isEditing = !!editProduct;

  // Reset form when dialog opens/closes or editProduct changes
  useEffect(() => {
    if (open) {
      if (editProduct) {
        setFormData({
          name: editProduct.title || editProduct.name || '',
          description: editProduct.description || '',
          price: editProduct.price?.toString() || '',
          imageUrl: editProduct.image_url || '',
          affiliateLink: editProduct.affiliate_link || '',
          category: editProduct.category_id || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          affiliateLink: '',
          category: '',
        });
      }
      setDuplicateWarning(null);
    }
  }, [open, editProduct]);

  // Check for duplicate affiliate link
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!formData.affiliateLink?.trim()) {
        setDuplicateWarning(null);
        return;
      }

      const { data: existing } = await supabase
        .from('products')
        .select('id, title, name')
        .eq('affiliate_link', formData.affiliateLink.trim())
        .maybeSingle();

      if (existing && (!isEditing || existing.id !== editProduct?.id)) {
        setDuplicateWarning(
          `This affiliate link already exists for product: "${existing.title || existing.name}"`
        );
      } else {
        setDuplicateWarning(null);
      }
    };

    const debounce = setTimeout(checkDuplicate, 300);
    return () => clearTimeout(debounce);
  }, [formData.affiliateLink, isEditing, editProduct?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (duplicateWarning) {
      toast.error('Please use a unique affiliate link');
      return;
    }

    setIsSubmitting(true);

    try {
      const priceValue = formData.price ? parseFloat(formData.price) : null;
      
      const productData: any = {
        title: formData.name.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: priceValue,
        image_url: formData.imageUrl.trim() || null,
        affiliate_link: formData.affiliateLink.trim() || null,
        module_id: moduleSlug,
        is_approved: true,
        category_id: null, // Optional - can be set if category functionality is added
      };

      if (isEditing && editProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product added successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['module-products', moduleSlug] });
      queryClient.invalidateQueries({ queryKey: ['module-product-count', moduleSlug] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the product details below'
              : 'Add a new product to this module\'s store'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="29.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Equipment"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliateLink">Affiliate Link</Label>
            <Input
              id="affiliateLink"
              type="url"
              value={formData.affiliateLink}
              onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
              placeholder="https://amazon.com/dp/..."
            />
          </div>

          {duplicateWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{duplicateWarning}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!duplicateWarning}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
