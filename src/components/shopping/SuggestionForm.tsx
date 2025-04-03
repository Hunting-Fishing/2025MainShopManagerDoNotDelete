
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories } from '@/hooks/useCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SuggestionForm: React.FC = () => {
  const { categories } = useCategories();
  const { suggestProduct } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    affiliateLink: '',
    categoryId: '',
    suggestionReason: ''
  });

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to suggest products",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || !formData.categoryId || !formData.suggestionReason) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await suggestProduct({
        title: formData.title,
        description: formData.description,
        affiliate_link: formData.affiliateLink,
        category_id: formData.categoryId,
        suggestion_reason: formData.suggestionReason
      });
      
      if (success) {
        setFormData({
          title: '',
          description: '',
          affiliateLink: '',
          categoryId: '',
          suggestionReason: ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Suggest a Product</CardTitle>
        <CardDescription>
          Help us grow our collection by suggesting products that you find useful
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Name *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the product"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="affiliateLink">Product Link</Label>
            <Input
              id="affiliateLink"
              name="affiliateLink"
              value={formData.affiliateLink}
              onChange={handleChange}
              placeholder="https://example.com/product"
              type="url"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleSelectChange('categoryId', value)}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.flatMap(category => [
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>,
                  ...(category.subcategories?.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      &nbsp;&nbsp;{sub.name}
                    </SelectItem>
                  )) || [])
                ])}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="suggestionReason">Why are you suggesting this product? *</Label>
            <Textarea
              id="suggestionReason"
              name="suggestionReason"
              value={formData.suggestionReason}
              onChange={handleChange}
              placeholder="Tell us why you recommend this product"
              rows={3}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !isAuthenticated}
          >
            {isLoading ? 'Submitting...' : 'Submit Suggestion'}
          </Button>
          
          {!isAuthenticated && (
            <p className="text-sm text-center text-muted-foreground">
              Please sign in to suggest products
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
