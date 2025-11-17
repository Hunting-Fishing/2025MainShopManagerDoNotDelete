import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ImageWithProgress {
  dataUrl: string;
  progress: number;
  timeRemaining?: string;
  uploading: boolean;
}

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [imagesWithProgress, setImagesWithProgress] = useState<ImageWithProgress[]>(
    images.map(img => ({ dataUrl: img, progress: 100, uploading: false }))
  );

  const simulateImageUpload = async (file: File, tempIndex: number) => {
    const startTime = Date.now();
    const fileSize = file.size;
    
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = (fileSize * (progress / 100)) / elapsed;
      const remaining = ((fileSize - (fileSize * (progress / 100))) / speed);
      
      const timeRemaining = remaining > 60 
        ? `${Math.ceil(remaining / 60)}m ${Math.ceil(remaining % 60)}s`
        : `${Math.ceil(remaining)}s`;
      
      setImagesWithProgress(prev => 
        prev.map((img, idx) => 
          idx === tempIndex 
            ? { ...img, progress, timeRemaining: progress < 100 ? timeRemaining : undefined }
            : img
        )
      );
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagesWithProgress(prev => 
        prev.map((img, idx) => 
          idx === tempIndex 
            ? { ...img, dataUrl: reader.result as string, uploading: false }
            : img
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (imagesWithProgress.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    const newImagesWithProgress: ImageWithProgress[] = acceptedFiles.map(() => ({
      dataUrl: '',
      progress: 0,
      uploading: true
    }));
    
    const startIndex = imagesWithProgress.length;
    setImagesWithProgress(prev => [...prev, ...newImagesWithProgress]);
    
    acceptedFiles.forEach((file, index) => {
      simulateImageUpload(file, startIndex + index);
    });

    toast({
      title: "Uploading Images",
      description: `Uploading ${acceptedFiles.length} image(s)...`,
    });
  }, [imagesWithProgress, maxImages]);

  React.useEffect(() => {
    const completedImages = imagesWithProgress
      .filter(img => !img.uploading && img.dataUrl)
      .map(img => img.dataUrl);
    
    if (completedImages.length !== images.length) {
      onImagesChange(completedImages);
    }
  }, [imagesWithProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: maxImages - imagesWithProgress.length,
    disabled: imagesWithProgress.length >= maxImages
  });

  const removeImage = (index: number) => {
    const filtered = imagesWithProgress.filter((_, i) => i !== index);
    setImagesWithProgress(filtered);
    onImagesChange(filtered.filter(img => !img.uploading && img.dataUrl).map(img => img.dataUrl));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...imagesWithProgress];
    const [primary] = newImages.splice(index, 1);
    newImages.unshift(primary);
    setImagesWithProgress(newImages);
    onImagesChange(newImages.filter(img => !img.uploading && img.dataUrl).map(img => img.dataUrl));
  };

  return (
    <div className="space-y-4">
      {imagesWithProgress.length < maxImages && (
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
                {imagesWithProgress.length}/{maxImages} images uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {imagesWithProgress.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagesWithProgress.map((imageWithProgress, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
                  {imageWithProgress.dataUrl ? (
                    <img
                      src={imageWithProgress.dataUrl}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                    </div>
                  )}
                  
                  {imageWithProgress.uploading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-4">
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Uploading...</span>
                          <div className="flex items-center gap-2">
                            {imageWithProgress.timeRemaining && (
                              <span className="text-muted-foreground">
                                {imageWithProgress.timeRemaining}
                              </span>
                            )}
                            <span className="font-medium">{Math.round(imageWithProgress.progress)}%</span>
                          </div>
                        </div>
                        <Progress value={imageWithProgress.progress} className="h-2" />
                      </div>
                    </div>
                  )}
                  
                  {!imageWithProgress.uploading && index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  
                  {!imageWithProgress.uploading && (
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
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
