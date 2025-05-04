import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import ImageUploader from './ImageUploader';
import { AffiliateTool } from '@/types/affiliate';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductFormProps {
  product?: Partial<AffiliateTool>;
  onSubmit: (product: Partial<AffiliateTool>) => Promise<void>;
  onCancel: () => void;
  categories: { id: string; name: string }[];
  manufacturers: { id: string; name: string }[];
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  categories,
  manufacturers,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<AffiliateTool>>(
    product || {
      name: '',
      description: '',
      price: undefined,
      salePrice: undefined,
      imageUrl: '',
      category: '',
      manufacturer: '',
      featured: false,
      bestSeller: false,
      affiliateLink: '',
      seller: '',
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.category || !formData.manufacturer || !formData.affiliateLink) {
      toast("Missing required fields", {
        description: "Please fill out all required fields"
      });
      return;
    }
    
    try {
      await onSubmit(formData);
      toast("Success", {
        description: `Product ${product ? 'updated' : 'created'} successfully.`
      });
    } catch (error) {
      console.error("Error submitting product:", error);
      toast("Error", {
        description: "Failed to save product. Please try again."
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Product name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="99.99"
                  value={formData.price ?? ''}
                  onChange={handleNumberChange}
                />
              </div>
              
              <div>
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="79.99"
                  value={formData.salePrice ?? ''}
                  onChange={handleNumberChange}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  name="category"
                  value={formData.category || ''} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Select 
                  name="manufacturer"
                  value={formData.manufacturer || ''} 
                  onValueChange={(value) => handleSelectChange("manufacturer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.name}>
                        {manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="seller">Seller</Label>
                <Input
                  id="seller"
                  name="seller"
                  placeholder="Amazon, Home Depot, etc."
                  value={formData.seller || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-1 items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => handleToggle("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                
                <div className="flex flex-1 items-center space-x-2">
                  <Switch
                    id="bestSeller"
                    checked={formData.bestSeller || false}
                    onCheckedChange={(checked) => handleToggle("bestSeller", checked)}
                  />
                  <Label htmlFor="bestSeller">Best Seller</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Product description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="min-h-[100px] resize-y"
                />
              </div>
              
              <div>
                <Label htmlFor="affiliateLink">Affiliate Link *</Label>
                <Input
                  id="affiliateLink"
                  name="affiliateLink"
                  placeholder="https://..."
                  value={formData.affiliateLink || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label>Product Image</Label>
                <ImageUploader 
                  onImageUploaded={handleImageUploaded}
                  currentImageUrl={formData.imageUrl}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
