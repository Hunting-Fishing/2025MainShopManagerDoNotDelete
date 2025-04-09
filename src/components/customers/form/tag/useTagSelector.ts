
import { useState, useRef, useEffect, useCallback } from "react";
import { predefinedTags } from "../schemas/referenceData";
import { supabase } from "@/lib/supabase";

export const useTagSelector = (
  selectedTags: string[] = [],
  onChange: (tags: string[]) => void
) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customTags, setCustomTags] = useState<{id: string, label: string, color: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch any custom tags from the database
  useEffect(() => {
    const fetchCustomTags = async () => {
      setLoading(true);
      try {
        // In a real implementation, fetch from a tags or customer_tags table
        const { data, error } = await supabase
          .from('customer_segments')
          .select('id, name, color')
          .order('name');
          
        if (error) {
          console.error('Error fetching custom tags:', error);
        } else if (data) {
          // Convert to our tag format
          setCustomTags(data.map(tag => ({
            id: tag.id,
            label: tag.name,
            color: tag.color || 'bg-blue-500'
          })));
        }
      } catch (error) {
        console.error('Error loading custom tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTags();
  }, []);
  
  // Combine predefined tags with custom tags
  const allTags = [...predefinedTags, ...customTags];

  // Handle clicking outside the suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleAddTag = useCallback((tag: string) => {
    // Check if it's already added
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      onChange(newTags);
      
      // If the tag doesn't exist in our predefined list, consider adding it to custom tags
      const tagExists = allTags.some(t => t.id === tag || t.label === tag);
      
      if (!tagExists && tag.trim() !== '') {
        // This would normally be persisted to the database
        const newCustomTag = {
          id: tag,
          label: tag,
          color: 'bg-gray-500' // Default color for new tags
        };
        
        setCustomTags(prev => [...prev, newCustomTag]);
        
        // In a real implementation, we would save this to the database:
        // await supabase.from('customer_tags').insert([{ name: tag }]);
      }
    }
    
    // Clean up the input and hide suggestions
    setInputValue("");
    setShowSuggestions(false);
  }, [selectedTags, onChange, allTags]);

  const handleRemoveTag = useCallback((tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  }, [selectedTags, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  }, [inputValue, handleAddTag]);

  return {
    inputValue,
    setInputValue,
    showSuggestions,
    setShowSuggestions,
    handleInputChange,
    handleInputFocus,
    handleAddTag,
    handleRemoveTag,
    handleKeyDown,
    inputRef,
    suggestionsRef,
    loading
  };
};
