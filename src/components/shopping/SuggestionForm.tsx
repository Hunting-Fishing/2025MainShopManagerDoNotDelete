
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/shopping';
import { useProducts } from '@/hooks/useProducts';
import { useToolCategories } from '@/hooks/useToolCategories';
import { ToolCategory } from '@/hooks/useToolCategories';
import { MANUFACTURERS } from '@/data/manufacturersData';

export function SuggestionForm() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { suggestProduct } = useProducts();
  const { toolCategories } = useToolCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  
  // Watch the category to populate subcategories
  const categoryValue = watch('category');
  
  // Effect to update subcategories when category changes
  useEffect(() => {
    if (categoryValue) {
      const selectedToolCategory = toolCategories.find(tc => tc.category === categoryValue);
      if (selectedToolCategory && selectedToolCategory.items) {
        setSubCategories(selectedToolCategory.items);
      } else {
        setSubCategories([]);
      }
      // Reset subcategory when category changes
      setValue('subcategory', '');
    }
  }, [categoryValue, toolCategories, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create metadata as JSON string
      const metadata = JSON.stringify({
        toolCategory: data.category || '',
        toolSubcategory: data.subcategory || '',
        manufacturer: data.manufacturer || ''
      });
      
      const suggestion: Partial<Product> = {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        image_url: data.image_url,
        affiliate_link: data.affiliate_link,
        product_type: 'suggested',
        category_id: 'suggestion', // Will be properly assigned by backend
        is_featured: false,
        is_bestseller: false,
        is_approved: false,
        suggested_by: 'user', // This would be replaced with actual user ID in a real app
        suggestion_reason: data.reason,
        metadata: metadata
      };

      await suggestProduct(suggestion);
      toast({
        title: "Thank you for your suggestion!",
        description: "Our team will review it soon.",
      });
      reset();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error submitting suggestion",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Product Title"
        required
        {...register('title', { required: "Product title is required" })}
        error={errors.title?.message as string}
        placeholder="Enter product name"
      />

      <FormField
        label="Description"
        required
        as={Textarea}
        {...register('description', { required: "Description is required" })}
        error={errors.description?.message as string}
        placeholder="Describe the product and its features"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            Tool Category
            <span className="text-destructive ml-1">*</span>
          </label>
          <Select
            value={categoryValue}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {toolCategories.map((category) => (
                <SelectItem key={category.category} value={category.category}>
                  {category.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs font-medium text-destructive">{errors.category.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            Subcategory
          </label>
          <Select
            disabled={!categoryValue || subCategories.length === 0}
            value={watch('subcategory') || ''}
            onValueChange={(value) => setValue('subcategory', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          Manufacturer
        </label>
        <Select 
          value={watch('manufacturer') || ''}
          onValueChange={(value) => setValue('manufacturer', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a manufacturer" />
          </SelectTrigger>
          <SelectContent>
            {MANUFACTURERS.map((manufacturer) => (
              <SelectItem key={manufacturer} value={manufacturer}>
                {manufacturer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FormField
        label="Price (optional)"
        type="number"
        step="0.01"
        {...register('price')}
        placeholder="Enter estimated price"
      />

      <FormField
        label="Image URL (optional)"
        {...register('image_url')}
        placeholder="Link to product image"
      />

      <FormField
        label="Amazon or Retailer Link (optional)"
        {...register('affiliate_link')}
        placeholder="https://www.example.com/product"
      />

      <FormField
        label="Why do you recommend this product? (optional)"
        as={Textarea}
        {...register('reason')}
        placeholder="Tell us why this product should be added to our store"
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Suggestion"}
      </Button>
    </form>
  );
}
