
import React from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { predefinedTags } from "../schemas/referenceData";

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
  // Filter suggestions based on input
  const filteredSuggestions = predefinedTags.filter(
    (tag) => 
      !tags.includes(tag.id) && 
      tag.label.toLowerCase().includes(inputValue.toLowerCase())
  );

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
            key={tag.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => onAddTag(tag.id)}
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
              onClick={() => onAddTag(inputValue)}
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
  );
};
