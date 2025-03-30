
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { TagSelector } from "../../form/tag";

interface CustomerFilterTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export const CustomerFilterTags: React.FC<CustomerFilterTagsProps> = ({
  tags,
  onChange,
}) => {
  const [tempTags, setTempTags] = useState<string[]>(tags || []);

  const handleTagsChange = (newTags: string[]) => {
    setTempTags(newTags);
    onChange(newTags);
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
