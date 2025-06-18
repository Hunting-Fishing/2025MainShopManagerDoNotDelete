
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function CategorySelector({ value, onValueChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching inventory categories...');
        
        const { data, error } = await supabase
          .from('inventory_categories')
          .select('name')
          .order('name');
          
        console.log('Supabase response:', { data, error });
        
        if (error) {
          console.error('Error fetching inventory categories:', error);
          setError('Failed to load categories');
          // Fallback to basic categories if database fetch fails
          setCategories([
            'Engine Components', 
            'Electrical', 
            'Brakes', 
            'Suspension', 
            'Exhaust', 
            'Filters', 
            'Fluids',
            'Transmission',
            'Cooling System',
            'Fuel System'
          ]);
        } else {
          const categoryNames = data?.map(item => item.name) || [];
          console.log('Categories loaded:', categoryNames.length, 'categories');
          setCategories(categoryNames);
        }
      } catch (err) {
        console.error('Error in fetchCategories:', err);
        setError('Failed to load categories');
        // Fallback categories
        setCategories([
          'Engine Components', 
          'Electrical', 
          'Brakes', 
          'Suspension', 
          'Exhaust', 
          'Filters', 
          'Fluids'
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex items-center gap-2 p-2 border rounded">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="p-2 border rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Category</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {categories.length === 0 ? (
            <SelectItem value="no-categories" disabled>
              No categories available
            </SelectItem>
          ) : (
            categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
