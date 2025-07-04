
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder = "Select a category",
  className = "",
  disabled = false
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('parts_categories')
          .select('name')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching parts categories:', error);
          return;
        }

        const categoryNames = data?.map(item => item.name) || [];
        setCategories(categoryNames);
      } catch (error) {
        console.error('Error in fetchCategories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className={`modern-input flex items-center justify-center ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`modern-input ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="modern-dropdown max-h-60 overflow-y-auto">
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
  );
}
