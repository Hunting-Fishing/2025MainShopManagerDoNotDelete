
import { useState, useEffect } from 'react';
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
import { isValidAmazonLink } from '@/utils/amazonUtils';
import { ImageUploadField } from './form/ImageUploadField';
import { Upload, Image } from 'lucide-react';

export function SuggestionForm() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { suggestProduct } = useProducts();
  const { toolCategories } = useToolCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Store the file in the form data
      setValue('product_image', file);
    }
  };
  
  const removeImage = () => {
    setValue('product_image', null);
    setImagePreview(null);
  };
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Create metadata as JSON string
      const metadata = JSON.stringify({
        toolCategory: data.category || '',
        toolSubcategory: data.subcategory || '',
        manufacturer: data.manufacturer || ''
      });
      
      // Handle image upload if present
      let imageUrl = '';
      if (data.product_image) {
        try {
          // In a real app, we would upload the image to storage here
          // For now, we'll just use the preview as a placeholder
          imageUrl = imagePreview || '';
          toast({
            title: "Image uploaded",
            description: "Your product image has been processed.",
          });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Image upload failed",
            description: "We couldn't upload your image. The product will be submitted without an image.",
            variant: "destructive",
          });
        }
      }
      
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

      await suggestProduct(suggestion);
      toast({
        title: "Thank you for your suggestion!",
        description: "Our team will review it soon.",
      });
      reset();
      setImagePreview(null);
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
      {/* Image Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          Product Image (optional)
        </label>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
            <Image className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Upload a product image</p>
            <Button 
              type="button" 
              variant="outline" 
              className="mt-2"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Select Image
            </Button>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        ) : (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Product preview" 
              className="max-h-48 rounded-md mx-auto object-contain border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      
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
        label="Amazon or Retailer Link (optional)"
        {...register('affiliate_link')}
        placeholder="https://www.amazon.com/product"
        description="Enter an Amazon link to the product"
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
