
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface ServiceCategoriesSelectProps {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ServiceCategoriesSelect({
  form,
  name = "serviceCategory",
  label = "Service Category",
  placeholder = "Select a service category",
  disabled = false
}: ServiceCategoriesSelectProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('service_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching service categories:", err);
        setError("Failed to load service categories");
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={disabled || isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
              </SelectTrigger>
              <SelectContent>
                {error ? (
                  <SelectItem value="error" disabled>
                    Error loading categories
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
                
                {categories.length === 0 && !isLoading && !error && (
                  <SelectItem value="empty" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
