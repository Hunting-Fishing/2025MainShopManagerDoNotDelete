
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/shopping';
import { useProducts } from '@/hooks/useProducts';
import { useToolCategories } from '@/hooks/useToolCategories';
import { MANUFACTURERS } from '@/data/manufacturersData';
import { TextAreaField } from './form/TextAreaField';
import { CategorySelector } from './form/CategorySelector';
import { ManufacturerSelector } from './form/ManufacturerSelector';
import { ImageUploadField } from './form/ImageUploadField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SuggestionForm() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      manufacturer: '',
      price: '',
      affiliate_link: '',
      reason: ''
    }
  });
  const { suggestProduct } = useProducts();
  const { toolCategories } = useToolCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const handleImageChange = (file: File | null, uploadedImageUrl?: string) => {
    if (uploadedImageUrl) {
      setImageUrl(uploadedImageUrl);
      console.log("Image URL set:", uploadedImageUrl);
    }
  };
  
  const onSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);
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
        affiliate_link: data.affiliate_link,
        image_url: imageUrl, // Use the uploaded image URL
        product_type: 'suggested',
        category_id: 'suggestion', // Will be properly assigned by backend
        is_featured: false,
        is_bestseller: false,
        is_approved: false,
        suggested_by: 'user', // This would be replaced with actual user ID in a real app
        suggestion_reason: data.reason,
        metadata: metadata
      };

      console.log("Submitting suggestion:", suggestion);
      await suggestProduct(suggestion);
      
      toast({
        title: "Thank you for your suggestion!",
        description: "Our team will review it soon.",
      });
      
      reset();
      setImageUrl(null);
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
      {/* Image Upload Field */}
      <ImageUploadField
        onImageChange={handleImageChange}
      />
      
      {/* Product Title Field */}
      <div className="space-y-2">
        <Label htmlFor="product-title" className="text-sm font-medium flex items-center">
          Product Title <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="product-title"
          {...register('title', { 
            required: "Product title is required" 
          })}
          placeholder="Enter product name"
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-xs font-medium text-destructive">
            {errors.title.message as string}
          </p>
        )}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="product-price" className="text-sm font-medium">
          Price (optional)
        </Label>
        <Input
          id="product-price"
          type="number" 
          step="0.01"
          {...register('price')}
          placeholder="Enter estimated price"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="affiliate-link" className="text-sm font-medium">
          Amazon or Retailer Link (optional)
        </Label>
        <Input
          id="affiliate-link"
          {...register('affiliate_link')}
          placeholder="https://www.amazon.com/product"
        />
        <p className="text-xs text-muted-foreground">
          Enter an Amazon link to the product
        </p>
      </div>

      <TextAreaField
        label="Why do you recommend this product? (optional)"
        name="reason"
        register={register}
        placeholder="Tell us why this product should be added to our store"
      />

      <Button type="submit" className="w-full rounded-full text-white bg-blue-600" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Suggestion"}
      </Button>
    </form>
  );
}
