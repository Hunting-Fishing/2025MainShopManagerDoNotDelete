
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
}

const ImageUploader = ({ onImageUploaded, currentImageUrl, className = "" }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // size in MB
    
    if (fileSize > 5) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create temporary preview
      const tempPreview = URL.createObjectURL(file);
      setPreviewUrl(tempPreview);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file);
        
      if (error) {
        console.error("Storage upload error:", error);
        
        // Check if bucket doesn't exist
        if (error.message?.includes("bucket") || error.message?.includes("not found")) {
          toast({
            title: "Storage not initialized",
            description: "Please try again in a moment as we set up storage",
            variant: "destructive"
          });
          
          // Try to initialize storage and retry upload
          try {
            const initResponse = await supabase.functions.invoke('initialize-storage');
            if (initResponse.error) throw initResponse.error;
            
            // Retry upload after initialization
            const { data: retryData, error: retryError } = await supabase.storage
              .from('products')
              .upload(filePath, file);
              
            if (retryError) throw retryError;
            
            const { data: publicUrlData } = supabase.storage
              .from('products')
              .getPublicUrl(filePath);
              
            onImageUploaded(publicUrlData.publicUrl);
            toast({
              title: "Image uploaded",
              description: "Your image has been uploaded successfully after storage initialization",
              variant: "success"
            });
            return;
          } catch (initError) {
            console.error("Error initializing storage:", initError);
            throw initError;
          }
        } else {
          throw error;
        }
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
        
      // Call the callback with the new URL
      onImageUploaded(publicUrlData.publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
        variant: "success"
      });
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload image",
        variant: "destructive"
      });
      
      // Clear preview on error
      if (!currentImageUrl) {
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    onImageUploaded('');
    setPreviewUrl(null);
  };
  
  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      {!previewUrl ? (
        <div className="p-4 flex flex-col items-center justify-center min-h-[140px] bg-slate-50 dark:bg-slate-900">
          <div className="mb-4 text-slate-400">
            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload a product image (max 5MB)
            </p>
          </div>
          <Button variant="outline" asChild className="bg-white dark:bg-slate-800">
            <label className="cursor-pointer flex gap-2 items-center">
              <Upload className="h-4 w-4" />
              <span>Select Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Preview image */}
          <img
            src={previewUrl}
            alt="Product image preview"
            className="w-full object-contain max-h-[200px]"
          />
          
          {/* Uploading indicator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          
          {/* Success indicator */}
          {!isUploading && (
            <div className="absolute top-0 right-0 m-2 flex gap-2">
              <Button 
                size="icon"
                variant="destructive" 
                className="h-8 w-8 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                size="icon"
                variant="default" 
                className="h-8 w-8 rounded-full bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
