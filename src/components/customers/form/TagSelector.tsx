
import React, { useState, useRef, useEffect } from "react";
import { CustomerFormValues, predefinedTags } from "./CustomerFormSchema";
import { FormControl } from "@/components/ui/form";
import { X, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagSelectorProps } from "./TagSelectorTypes";

export const TagSelector: React.FC<TagSelectorProps> = ({ form, field, disabled }) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Set up click outside listener to close suggestions
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

  // Get current tags and update form value
  const tags = field.value || [];

  // Handle adding a tag
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      field.onChange(updatedTags);
    }
    setInputValue("");
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle removing a tag
  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag: string) => tag !== tagToRemove);
    field.onChange(updatedTags);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Filter suggestions based on input
  const filteredSuggestions = predefinedTags.filter(
    (tag) => 
      !tags.includes(tag.id) && 
      tag.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-white min-h-[40px]">
        {tags.map((tag: string) => {
          const tagInfo = predefinedTags.find((t) => t.id === tag) || {
            label: tag,
            color: "bg-gray-500"
          };
          
          return (
            <Badge 
              key={tag} 
              variant="outline"
              className={`${tagInfo.color} text-white px-2 py-1 text-xs rounded-full flex items-center gap-1`}
            >
              <span>{tagInfo.label}</span>
              {!disabled && (
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              )}
            </Badge>
          );
        })}
        
        {!disabled && (
          <div className="flex-1 min-w-[120px]">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder={tags.length ? "Add more tags..." : "Add tags..."}
                className="border-0 h-8 p-0 focus-visible:ring-0 bg-transparent"
              />
              
              {showSuggestions && (
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
                        key={tag.id}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => addTag(tag.id)}
                      >
                        <Badge className={`${tag.color} text-white w-2 h-2 p-0 rounded-full`} />
                        <span>{tag.label}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      {inputValue ? (
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:text-blue-500"
                          onClick={() => addTag(inputValue)}
                        >
                          <Plus size={16} />
                          <span>Create "{inputValue}"</span>
                        </div>
                      ) : (
                        "No more tags available"
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
