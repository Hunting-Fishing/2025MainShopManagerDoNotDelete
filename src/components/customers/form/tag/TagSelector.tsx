
import React from "react";
import { Input } from "@/components/ui/input";
import { TagBadge } from "./TagBadge";
import { TagSuggestions } from "./TagSuggestions";
import { useTagSelector } from "./useTagSelector";
import { TagSelectorProps } from "../TagSelectorTypes";

export const TagSelector: React.FC<TagSelectorProps> = (props) => {
  const { disabled } = props;
  const {
    inputValue,
    showSuggestions,
    tags,
    inputRef,
    suggestionsRef,
    addTag,
    removeTag,
    handleInputChange,
    handleKeyDown,
    setShowSuggestions
  } = useTagSelector(props);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-white min-h-[40px] focus-within:ring-1 focus-within:ring-ring focus-within:border-input">
        {tags.map((tag: string) => (
          <TagBadge 
            key={tag}
            tag={tag}
            onRemove={removeTag}
            disabled={disabled}
          />
        ))}
        
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
                <TagSuggestions
                  inputValue={inputValue}
                  tags={tags}
                  onAddTag={addTag}
                  suggestionsRef={suggestionsRef}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
