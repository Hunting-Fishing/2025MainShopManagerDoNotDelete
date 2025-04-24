
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CustomerTagsProps {
  tags: string[];
}

export const CustomerTags: React.FC<CustomerTagsProps> = ({ tags }) => {
  // Limit the number of tags displayed to 3
  const displayTags = tags.slice(0, 3);
  const remainingTagCount = tags.length > 3 ? tags.length - 3 : 0;

  return (
    <div className="flex items-center gap-1">
      {displayTags.map((tag, index) => (
        <Badge 
          key={`${tag}-${index}`} 
          variant="outline" 
          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 border-blue-300"
        >
          {tag}
        </Badge>
      ))}
      {remainingTagCount > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border-gray-300"
        >
          +{remainingTagCount}
        </Badge>
      )}
    </div>
  );
};
