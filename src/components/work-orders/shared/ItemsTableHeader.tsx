
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ItemsTableHeaderProps {
  showType: 'overview' | 'labor' | 'parts';
  isEditMode?: boolean;
  onAddItem?: () => void;
}

export function ItemsTableHeader({ 
  showType, 
  isEditMode = false, 
  onAddItem 
}: ItemsTableHeaderProps) {
  const getHeaders = () => {
    const baseHeaders = ['Item', 'Description'];
    
    switch (showType) {
      case 'labor':
        return [...baseHeaders, 'Hours', 'Rate', 'Status'];
      case 'parts':
        return [...baseHeaders, 'Qty', 'Price', 'Status'];
      default:
        return [...baseHeaders, 'Hours/Qty', 'Rate/Price', 'Status'];
    }
  };

  const headers = getHeaders();
  if (isEditMode) {
    headers.push('Actions');
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">
        {showType === 'labor' ? 'Labor' : showType === 'parts' ? 'Parts' : 'Labor & Parts'}
      </h3>
      {isEditMode && onAddItem && (
        <Button size="sm" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add {showType === 'labor' ? 'Labor' : showType === 'parts' ? 'Part' : 'Item'}
        </Button>
      )}
    </div>
  );
}
