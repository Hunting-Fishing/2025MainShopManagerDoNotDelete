
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';

interface ImageUploadFieldProps {
  onImageChange: (file: File | null) => void;
  initialImage?: string | null;
}

export function ImageUploadField({ onImageChange, initialImage }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Pass the file up to the parent component
      onImageChange(file);
    }
  };
  
  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        Product Image
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
