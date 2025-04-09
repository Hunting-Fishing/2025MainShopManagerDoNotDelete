
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface TagSuggestionsProps {
  inputValue: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  suggestionsRef: React.RefObject<HTMLDivElement>;
}

export const TagSuggestions: React.FC<TagSuggestionsProps> = ({
  inputValue,
  tags,
  onAddTag,
  suggestionsRef
}) => {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tags from the database
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('document_tags')
          .select('name')
          .order('usage_count', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error("Error fetching tags:", error);
          return;
        }
        
        const tagNames = data?.map(tag => tag.name) || [];
        setSuggestedTags(tagNames);
      } catch (error) {
        console.error("Error in tag fetching:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  // Filter suggestions based on input
  const filteredSuggestions = suggestedTags.filter(
    (tag) => 
      !tags.includes(tag) && 
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Function to save a new custom tag to the database
  const saveCustomTag = async (tag: string) => {
    try {
      // This will trigger our trigger function to insert or update the tag
      console.log('Saving custom tag:', tag);
      // We don't need to manually save it, as it will be added when the document is saved
    } catch (error) {
      console.error('Error saving custom tag:', error);
    }
  };

  const handleAddCustomTag = (tag: string) => {
    // Save to database first (handled by the trigger when document is saved)
    saveCustomTag(tag);
    // Then add to the UI
    onAddTag(tag);
  };

  if (isLoading) {
    return (
      <div 
        ref={suggestionsRef}
        className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-3 text-center text-gray-500"
      >
        Loading tags...
      </div>
    );
  }

  return (
    <div 
      ref={suggestionsRef}
      className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div className="p-2 text-xs text-gray-500 border-b">
        Click to add or type a custom tag
      </div>
      {filteredSuggestions.length > 0 ? (
        filteredSuggestions.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => onAddTag(tag)}
          >
            <Badge className="bg-blue-500 text-white w-2 h-2 p-0 rounded-full" />
            <span>{tag}</span>
          </div>
        ))
      ) : (
        <div className="p-3 text-sm text-gray-500">
          {inputValue ? (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-blue-500"
              onClick={() => handleAddCustomTag(inputValue)}
            >
              <Plus size={16} />
              <span>Create "{inputValue}"</span>
            </div>
          ) : (
            suggestedTags.length === 0 ? "No tags available" : "No matching tags"
          )}
        </div>
      )}
    </div>
  );
};
