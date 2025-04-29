
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/shopping';
import { useProducts } from '@/hooks/useProducts';
import { useToolCategories } from '@/hooks/useToolCategories';
import { MANUFACTURERS } from '@/data/manufacturersData';
import { TextAreaField } from './form/TextAreaField';
import { CategorySelector } from './form/CategorySelector';
import { ManufacturerSelector } from './form/ManufacturerSelector';

export function SuggestionForm() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { suggestProduct } = useProducts();
  const { toolCategories } = useToolCategories();
  const [isLoading, setIsLoading] = useState(false);
  
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

      <TextAreaField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Describe the product and its features"
        required
      />

      <CategorySelector
        toolCategories={toolCategories}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />

      <ManufacturerSelector
        manufacturers={MANUFACTURERS}
        watch={watch}
        setValue={setValue}
      />

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

      <TextAreaField
        label="Why do you recommend this product? (optional)"
        name="reason"
        register={register}
        placeholder="Tell us why this product should be added to our store"
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Suggestion"}
      </Button>
    </form>
  );
}
