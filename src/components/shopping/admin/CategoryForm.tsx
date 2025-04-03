
import React, { useState, useEffect } from 'react';
import { ProductCategory } from '@/types/shopping';
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
import { 
  createCategory, 
  updateCategory, 
  getCategoryBySlug 
} from '@/services/shopping/categoryService';
import { toast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';

interface CategoryFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryId,
  onSuccess,
  onCancel
}) => {
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ProductCategory>>({
    name: '',
    slug: '',
    parent_id: undefined,
    description: ''
  });

  useEffect(() => {
    const loadCategory = async () => {
      if (categoryId) {
        setIsEditing(true);
        setIsLoading(true);
        try {
          // Find the category in our loaded categories
          const category = categories.find(c => c.id === categoryId) || 
                           categories.flatMap(c => c.subcategories || []).find(sc => sc.id === categoryId);
          
          if (category) {
            setFormData(category);
          }
        } catch (err) {
          toast({
            title: "Error loading category",
            description: "Could not load category details",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadCategory();
  }, [categoryId, categories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name if creating a new category
    if (name === 'name' && !isEditing) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSelectChange = (name: string, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing && categoryId) {
        await updateCategory(categoryId, formData);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await createCategory(formData);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update category" : "Failed to create category",
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

  // Filter out the current category from parent options to prevent circular references
  const parentOptions = categories.filter(c => c.id !== categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Enter category name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug || ''}
          onChange={handleChange}
          placeholder="category-slug"
          required
        />
        <p className="text-xs text-muted-foreground">
          URL-friendly identifier. Use only lowercase letters, numbers, and hyphens.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="parent_id">Parent Category</Label>
        <Select
          value={formData.parent_id || ''}
          onValueChange={(value) => handleSelectChange('parent_id', value || undefined)}
        >
          <SelectTrigger id="parent_id">
            <SelectValue placeholder="None (Top-level category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None (Top-level category)</SelectItem>
            {parentOptions.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Category description"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};
