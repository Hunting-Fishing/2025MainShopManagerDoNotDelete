import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const newImages = await Promise.all(
        acceptedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      onImagesChange([...images, ...newImages]);
      toast({
        title: "Images Uploaded",
        description: `${newImages.length} image(s) added successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [primary] = newImages.splice(index, 1);
    newImages.unshift(primary);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-muted-foreground">Drop images here...</p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Drag & drop images here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                {images.length}/{maxImages} images uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {index !== 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => setPrimaryImage(index)}
                      >
                        <ImageIcon className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
