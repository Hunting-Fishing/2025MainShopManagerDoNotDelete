
import { useState, useEffect } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCategory } from '@/hooks/useToolCategories';

interface CategorySelectorProps {
  toolCategories: ToolCategory[];
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: Record<string, any>;
}

export function CategorySelector({ 
  toolCategories, 
  watch, 
  setValue, 
  errors 
}: CategorySelectorProps) {
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const categoryValue = watch('category');
  
  // Effect to update subcategories when category changes
  useEffect(() => {
    if (categoryValue) {
      const selectedToolCategory = toolCategories.find(tc => tc.category === categoryValue);
      if (selectedToolCategory && selectedToolCategory.items) {
        setSubCategories(selectedToolCategory.items);
      } else {
        setSubCategories([]);
      }
      // Reset subcategory when category changes
      setValue('subcategory', '');
    }
  }, [categoryValue, toolCategories, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          Tool Category
          <span className="text-destructive ml-1">*</span>
        </label>
        <Select
          value={categoryValue || ''}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {toolCategories.map((category) => (
              <SelectItem key={category.category} value={category.category}>
                {category.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs font-medium text-destructive">{errors.category.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          Subcategory
        </label>
        <Select
          disabled={!categoryValue || subCategories.length === 0}
          value={watch('subcategory') || ''}
          onValueChange={(value) => setValue('subcategory', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
