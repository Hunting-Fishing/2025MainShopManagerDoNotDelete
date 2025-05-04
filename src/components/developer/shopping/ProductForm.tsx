
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AffiliateTool } from "@/types/affiliate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import TagSelector from './TagSelector';
import ImageUploader from './ImageUploader';

// Define common tags for products
const commonTags = [
  "Professional", "DIY", "Cordless", "Electric", "Hand Tool", 
  "Air Tool", "Battery-Powered", "Heavy Duty", "Lightweight", 
  "Workshop", "Garage", "Industrial", "Home Use", "New", "Best Seller"
];

interface ProductFormProps {
  product?: Partial<AffiliateTool>;
  onSubmit: (product: Partial<AffiliateTool>) => Promise<void>;
  categories: { id: string; name: string }[];
  manufacturers: { id: string; name: string }[];
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, onSubmit, categories, manufacturers, isSubmitting = false 
}) => {
  const [formData, setFormData] = useState<Partial<AffiliateTool>>({
    name: '',
    description: '',
    price: undefined,
    salePrice: undefined,
    category: '',
    subcategory: '',
    manufacturer: '',
    featured: false,
    bestSeller: false,
    affiliateLink: '',
    tags: [], // Initialize tags array
    ...product
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [imageUrl, setImageUrl] = useState<string>(product?.imageUrl || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(product?.tags || []);
  
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        ...product,
      }));
      setImageUrl(product.imageUrl || '');
      setSelectedTags(product.tags || []);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setFormData(prev => ({
      ...prev,
      imageUrl: url,
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    setFormData(prev => ({
      ...prev,
      tags: tags,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      imageUrl,
      tags: selectedTags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="media">Media & Tags</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
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
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Describe the product..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={handleChange}
                    placeholder="0.00"
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
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  name="category"
                  value={formData.category || ''} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                <Input
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory || ''}
                  onChange={handleChange}
                  placeholder="Subcategory"
                />
              </div>
              
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Select 
                  name="manufacturer"
                  value={formData.manufacturer || ''} 
                  onValueChange={(value) => handleSelectChange('manufacturer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="affiliateLink">Affiliate Link</Label>
                <Input
                  id="affiliateLink"
                  name="affiliateLink"
                  value={formData.affiliateLink || ''}
                  onChange={handleChange}
                  placeholder="https://"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={!!formData.featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bestSeller"
                    name="bestSeller"
                    checked={!!formData.bestSeller}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="bestSeller">Best Seller</Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="media" className="space-y-4">
            <div className="grid gap-6">
              <div>
                <Label htmlFor="image">Product Image</Label>
                <ImageUploader
                  currentImageUrl={imageUrl}
                  onImageUploaded={handleImageUpload}
                  className="mt-2"
                />
              </div>
              
              <div>
                <TagSelector
                  selectedTags={selectedTags}
                  onChange={handleTagsChange}
                  label="Product Tags"
                  placeholder="Add product tags..."
                  suggestedTags={commonTags}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : product?.id ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
