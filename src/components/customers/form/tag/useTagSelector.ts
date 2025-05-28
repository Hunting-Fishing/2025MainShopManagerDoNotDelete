import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';

export const useTagSelector = (customer?: Customer) => {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('customer_tags')
          .select('name')
          .order('name', { ascending: true });
        
        if (error) {
          console.error("Error fetching tags:", error);
          toast({
            title: "Error",
            description: "Failed to load tags. Please try again.",
            variant: "destructive"
          });
        } else {
          const tagNames = data.map(tag => tag.name);
          setAvailableTags(tagNames);
          
          // If customer exists, initialize with their tags
          if (customer && customer.tags) {
            setTags(customer.tags);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, [customer]);
  
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  return {
    tags,
    availableTags,
    isLoading,
    addTag,
    removeTag,
  };
};
