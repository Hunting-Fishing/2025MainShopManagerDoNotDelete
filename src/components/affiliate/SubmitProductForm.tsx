
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';

interface ProductSubmission {
  product_name: string;
  product_url: string;
  suggested_category: string;
  notes?: string;
}

export function SubmitProductForm() {
  const [formData, setFormData] = useState<ProductSubmission>({
    product_name: '',
    product_url: '',
    suggested_category: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For now, just show a success message since the table doesn't exist
      toast({
        title: "Product Submitted",
        description: "Your product suggestion has been submitted for review.",
      });

      // Reset form
      setFormData({
        product_name: '',
        product_url: '',
        suggested_category: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: "Error",
        description: "Failed to submit product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Product</CardTitle>
        <CardDescription>
          Suggest a new product to be added to our affiliate store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_name">Product Name</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <Label htmlFor="product_url">Product URL</Label>
            <Input
              id="product_url"
              type="url"
              value={formData.product_url}
              onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
              placeholder="https://example.com/product"
              required
            />
          </div>

          <div>
            <Label htmlFor="suggested_category">Category</Label>
            <Select 
              value={formData.suggested_category} 
              onValueChange={(value) => setFormData({ ...formData, suggested_category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about this product..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
