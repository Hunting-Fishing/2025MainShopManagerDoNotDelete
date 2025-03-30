
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { TagSelector } from "../../form/TagSelector";

interface CustomerFilterTagsProps {
  initialTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const CustomerFilterTags: React.FC<CustomerFilterTagsProps> = ({
  initialTags,
  onTagsChange,
}) => {
  const [tempTags, setTempTags] = useState<string[]>(initialTags || []);

  const handleTagsChange = (newTags: string[]) => {
    setTempTags(newTags);
    onTagsChange(newTags);
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <TagSelector 
        form={{ 
          setValue: (_name: string, value: string[]) => handleTagsChange(value), 
          watch: () => tempTags
        }}
        field={{ 
          name: "tags", 
          value: tempTags,
          onChange: (value: string[]) => handleTagsChange(value) 
        }}
      />
    </div>
  );
};
