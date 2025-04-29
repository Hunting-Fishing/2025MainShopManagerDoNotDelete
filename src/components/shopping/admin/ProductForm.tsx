
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '@/types/shopping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/hooks/useCategories';
import { 
  createProduct, 
  updateProduct, 
  getProductById 
} from '@/services/shopping/productService';
import { toast } from '@/hooks/use-toast';

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productId,
  onSuccess,
  onCancel
}) => {
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    description: '',
    image_url: '',
    price: undefined,
    affiliate_link: '',
    tracking_params: '',
    category_id: '',
    is_featured: false,
    is_bestseller: false,
    is_approved: true,
    product_type: 'affiliate'
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        setIsEditing(true);
        setIsLoading(true);
        try {
          const product = await getProductById(productId);
          if (product) {
            setFormData(product);
          }
        } catch (err) {
          toast({
            title: "Error loading product",
            description: "Could not load product details",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadProduct();
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing && productId) {
        await updateProduct(productId, formData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Ensure formData has title and category_id
        await createProduct({
          ...formData,
          title: formData.title!, // Non-null assertion because we checked above
          category_id: formData.category_id! // Non-null assertion because we checked above
        });
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update product" : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Product Name *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          placeholder="Enter product name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Product description"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            value={formData.price !== undefined ? formData.price : ''}
            onChange={handleChange}
            placeholder="29.99"
            type="number"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="affiliate_link">Affiliate Link</Label>
        <Input
          id="affiliate_link"
          name="affiliate_link"
          value={formData.affiliate_link || ''}
          onChange={handleChange}
          placeholder="https://amazon.com/product"
          type="url"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tracking_params">Tracking Parameters</Label>
        <Input
          id="tracking_params"
          name="tracking_params"
          value={formData.tracking_params || ''}
          onChange={handleChange}
          placeholder="?tag=yourtag-20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category_id">Category *</Label>
        <Select
          value={formData.category_id || ''}
          onValueChange={(value) => handleSelectChange('category_id', value)}
          required
        >
          <SelectTrigger id="category_id">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.flatMap(category => [
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>,
              ...(category.subcategories?.map(sub => (
                <SelectItem key={sub.id} value={sub.id}>
                  &nbsp;&nbsp;{sub.name}
                </SelectItem>
              )) || [])
            ])}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_featured">Featured Product</Label>
            <Switch
              id="is_featured"
              checked={formData.is_featured || false}
              onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_bestseller">Bestseller</Label>
            <Switch
              id="is_bestseller"
              checked={formData.is_bestseller || false}
              onCheckedChange={(checked) => handleSwitchChange('is_bestseller', checked)}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_approved">Approved</Label>
          <Switch
            id="is_approved"
            checked={formData.is_approved || false}
            onCheckedChange={(checked) => handleSwitchChange('is_approved', checked)}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
