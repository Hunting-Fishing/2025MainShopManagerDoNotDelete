
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadFieldProps {
  onImageChange: (file: File | null, imageUrl?: string) => void;
  initialImage?: string | null;
}

export function ImageUploadField({ onImageChange, initialImage }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Start the upload process
      setIsUploading(true);
      
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { data, error } = await supabase
          .storage
          .from('product_images')
          .upload(filePath, file);
          
        if (error) {
          throw error;
        }
        
        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase
          .storage
          .from('product_images')
          .getPublicUrl(filePath);
          
        const imageUrl = publicUrlData.publicUrl;
        
        // Pass the file and public URL up to the parent component
        onImageChange(file, imageUrl);
        
        toast({
          title: "Image uploaded successfully",
          description: "Your product image has been uploaded.",
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload the image. Please try again.",
          variant: "destructive",
        });
        // Still allow the file preview but pass null for the URL
        onImageChange(file);
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        Product Image {isUploading && <span className="ml-2 text-xs text-blue-500">Uploading...</span>}
      </label>
      
      {!preview ? (
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
            src={preview} 
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
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
