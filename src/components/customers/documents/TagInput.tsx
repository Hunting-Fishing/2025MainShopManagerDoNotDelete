
import React, { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = "Add tag...",
  className
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      
      // Normalize tag (trim and lowercase)
      const newTag = inputValue.trim().toLowerCase();
      
      // Check if tag already exists
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      
      setInputValue('');
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn("flex flex-wrap gap-2 p-1 border rounded-md bg-background", className)}>
      {value.map(tag => (
        <Badge 
          key={tag} 
          variant="secondary"
          className="text-xs font-normal"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 rounded-full hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-0 h-6 text-sm"
      />
    </div>
  );
};
