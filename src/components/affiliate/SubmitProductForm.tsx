import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubmitProductFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function SubmitProductForm({ onSubmit, isLoading }: SubmitProductFormProps) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Other'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select an image to upload.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${productName.replace(/\s+/g, '_')}.${fileExtension}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
        setUploading(false);
        return;
      }

      const publicURL = `${supabase.storageUrl}/object/public/${data.Key}`;
      setImageUrl(publicURL);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!productName || !description || !category || !imageUrl) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    const productData = {
      name: productName,
      description,
      category,
      image_url: imageUrl,
    };
    onSubmit(productData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Product</CardTitle>
        <CardDescription>
          Help us expand our catalog by submitting your product for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image Upload</Label>
          <Input
            type="file"
            id="image"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" asChild>
            <Label htmlFor="image" className="flex items-center justify-center">
              {file ? file.name : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Select Image</span>
                </>
              )}
            </Label>
          </Button>
          {file && (
            <div className="flex items-center justify-between">
              <span>{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            variant="secondary"
            className="mt-2"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Storage
              </>
            )}
          </Button>
          {imageUrl && (
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-green-500" />
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                View Image
              </a>
            </div>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Product'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
