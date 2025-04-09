
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useTagSelector = (selectedTags: string[], onChange: (tags: string[]) => void) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch popular tags from the database
  const fetchPopularTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_tags')
        .select('name')
        .order('usage_count', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("Error fetching tags:", error);
      }
      
      return data?.map(tag => tag.name) || [];
    } catch (error) {
      console.error("Error in tag fetching:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleAddTag = async (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      onChange(newTags);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  return {
    inputValue,
    showSuggestions,
    handleInputChange,
    handleInputFocus,
    handleAddTag,
    handleRemoveTag,
    handleKeyDown,
    inputRef,
    suggestionsRef,
    loading,
    fetchPopularTags
  };
};
