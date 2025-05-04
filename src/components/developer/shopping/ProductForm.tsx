
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AffiliateTool } from '@/types/affiliate';
import TagSelector from './TagSelector';
import ImageUploader from './ImageUploader';

interface ProductFormProps {
  product?: AffiliateTool;
  onSubmit: (product: Partial<AffiliateTool>) => Promise<void>;
}

export default function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<AffiliateTool>>(product || {
    name: '',
    description: '',
    price: 0,
    salePrice: undefined,
    category: '',
    subcategory: '',
    manufacturer: '',
    rating: undefined,
    reviewCount: undefined,
    featured: false,
    bestSeller: false,
    affiliateLink: '',
    imageUrl: '',
    slug: '',
    seller: '',
    tags: []
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(product?.tags || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Include tags in the submission
      const productWithTags = { 
        ...formData,
        tags: selectedTags,
        // Generate a slug if it's a new product and no slug provided
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-')
      };
      
      await onSubmit(productWithTags);
    } catch (error) {
      console.error("Error submitting product form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  const suggestedTags = [
    "automotive", "tools", "equipment", "outdoor", "power tools", 
    "hand tools", "accessories", "safety", "mechanic", "garage", 
    "professional", "DIY", "sale", "new arrival", "limited edition"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details & Pricing</TabsTrigger>
          <TabsTrigger value="media">Media & Classification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Product Name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Product Description"
                className="h-32"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer || ''}
                  onChange={handleChange}
                  placeholder="Manufacturer"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  placeholder="Category"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                name="subcategory"
                value={formData.subcategory || ''}
                onChange={handleChange}
                placeholder="Subcategory (optional)"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={handleChange}
                placeholder="Price"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="salePrice">Sale Price ($)</Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice || ''}
                onChange={handleChange}
                placeholder="Sale Price (if applicable)"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="affiliateLink">Affiliate Link *</Label>
            <Input
              id="affiliateLink"
              name="affiliateLink"
              value={formData.affiliateLink || ''}
              onChange={handleChange}
              placeholder="https://example.com/product"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="seller">Seller</Label>
            <Input
              id="seller"
              name="seller"
              value={formData.seller || ''}
              onChange={handleChange}
              placeholder="Seller/Store Name"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating ?? ''}
                onChange={handleChange}
                placeholder="Product Rating"
              />
            </div>
            
            <div>
              <Label htmlFor="reviewCount">Review Count</Label>
              <Input
                id="reviewCount"
                name="reviewCount"
                type="number"
                value={formData.reviewCount ?? ''}
                onChange={handleChange}
                placeholder="Number of Reviews"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="slug">Slug (URL-friendly name)</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug || ''}
              onChange={handleChange}
              placeholder="product-name-slug"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave blank to auto-generate from product name
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4">
          <div>
            <Label>Product Image</Label>
            <div className="mt-2">
              <ImageUploader 
                initialImageUrl={formData.imageUrl} 
                onImageUploaded={handleImageUpload}
                maxWidth={800}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags">Product Tags</Label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              placeholder="Add product tags..."
              suggestedTags={suggestedTags}
            />
          </div>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="bestSeller"
                checked={formData.bestSeller || false}
                onCheckedChange={(checked) => handleSwitchChange('bestSeller', checked)}
              />
              <Label htmlFor="bestSeller">Best Seller</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
}
