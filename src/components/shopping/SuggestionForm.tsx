
import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToolCategories } from '@/hooks/useToolCategories';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { isValidAmazonLink, cleanAmazonUrl, extractAmazonASIN, generateAmazonTrackingParams } from '@/utils/amazonUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MANUFACTURERS } from '@/data/manufacturersData';

export const SuggestionForm: React.FC = () => {
  const { suggestProduct } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { toolCategories, isLoading: toolCategoriesLoading } = useToolCategories();
  
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    imageUrl: '',
    affiliateLink: '',
    categoryId: '',
    toolCategory: '',
    manufacturer: '',
    reason: '',
    price: '',
  });
  
  const [validLink, setValidLink] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);

  // Validate affiliate link when it changes
  useEffect(() => {
    if (formState.affiliateLink) {
      setValidLink(isValidAmazonLink(formState.affiliateLink));
    } else {
      setValidLink(null);
    }
  }, [formState.affiliateLink]);

  // Update filtered items when tool category changes
  useEffect(() => {
    if (formState.toolCategory) {
      const selectedCategory = toolCategories.find(cat => cat.category === formState.toolCategory);
      if (selectedCategory) {
        setFilteredItems(selectedCategory.items);
      }
    } else {
      setFilteredItems([]);
    }
  }, [formState.toolCategory, toolCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.title || !formState.categoryId) {
      toast({
        title: "Missing required fields",
        description: "Please provide a product title and category",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process the affiliate link if it exists
      let processedLink = formState.affiliateLink;
      let trackingParams = '';
      
      if (processedLink) {
        // Clean the link
        processedLink = cleanAmazonUrl(processedLink);
        
        // Generate tracking parameters
        const asin = extractAmazonASIN(processedLink);
        if (asin) {
          trackingParams = generateAmazonTrackingParams().replace('{ASIN}', asin);
        }
      }
      
      // Convert price to number if present
      const price = formState.price ? parseFloat(formState.price) : undefined;
      
      // Additional metadata to store tool category and manufacturer
      const metadata = {
        tool_category: formState.toolCategory,
        tool_subcategory: formState.toolCategory ? filteredItems.join(', ') : '',
        manufacturer: formState.manufacturer
      };
      
      // Submit the product suggestion
      const success = await suggestProduct({
        title: formState.title,
        description: formState.description,
        image_url: formState.imageUrl,
        affiliate_link: processedLink,
        tracking_params: trackingParams,
        category_id: formState.categoryId,
        suggestion_reason: formState.reason,
        price,
        product_type: 'suggested',
        metadata: JSON.stringify(metadata),
      });
      
      if (success) {
        setSubmitted(true);
        setFormState({
          title: '',
          description: '',
          imageUrl: '',
          affiliateLink: '',
          categoryId: '',
          toolCategory: '',
          manufacturer: '',
          reason: '',
          price: '',
        });
        
        // Reset form state after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error submitting suggestion",
        description: "There was a problem submitting your product suggestion",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggest a Tool</CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-center">Thank you for your suggestion!</h3>
            <p className="text-center text-muted-foreground mt-2">
              Our team will review your submission shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tool Name <span className="text-red-500">*</span></Label>
              <Input 
                id="title"
                name="title"
                value={formState.title}
                onChange={handleChange}
                placeholder="Enter the tool name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                placeholder="Describe the tool and its uses"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Product Category <span className="text-red-500">*</span></Label>
                <Select
                  value={formState.categoryId}
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Approximate Price (USD)</Label>
                <Input 
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toolCategory">Tool Category</Label>
              <Select
                value={formState.toolCategory}
                onValueChange={(value) => handleSelectChange('toolCategory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tool category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {toolCategoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading tool categories...</SelectItem>
                  ) : (
                    toolCategories.map((toolCat, index) => (
                      <SelectItem key={index} value={toolCat.category}>
                        {toolCat.category}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {formState.toolCategory && filteredItems.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-md border">
                <Label className="block mb-2 text-sm font-medium">Subcategories in this tool category:</Label>
                <div className="flex flex-wrap gap-2">
                  {filteredItems.map((item, i) => (
                    <span key={i} className="text-sm px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800 border border-blue-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select
                value={formState.manufacturer}
                onValueChange={(value) => handleSelectChange('manufacturer', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manufacturer (if applicable)" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="">Not manufacturer specific</SelectItem>
                  {MANUFACTURERS.map((manufacturer, index) => (
                    <SelectItem key={index} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a manufacturer if this tool is specific to a certain make of vehicle
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="affiliateLink" className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                Amazon Link
              </Label>
              <Input 
                id="affiliateLink"
                name="affiliateLink"
                value={formState.affiliateLink}
                onChange={handleChange}
                placeholder="https://www.amazon.com/..."
                className={validLink === false ? "border-red-500" : ""}
              />
              
              {validLink === false && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please enter a valid Amazon product URL
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl"
                name="imageUrl"
                value={formState.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Direct link to product image (optional)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Why do you recommend this tool?</Label>
              <Textarea 
                id="reason"
                name="reason"
                value={formState.reason}
                onChange={handleChange}
                placeholder="Share why you think this tool would be useful"
                rows={3}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || validLink === false}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              * Required fields
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
