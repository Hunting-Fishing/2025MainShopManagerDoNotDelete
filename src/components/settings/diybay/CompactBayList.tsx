
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, History, Loader2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";

interface CompactBayListProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
  sortable?: boolean;
}

interface CompactBayItemProps {
  bay: Bay;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
  sortable?: boolean;
}

// Sortable wrapper for CompactBayItem
const SortableCompactBayItem = ({ bay, onStatusChange, onEditClick, onDeleteClick, onHistoryClick, isSaving = false, sortable = false }: CompactBayItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: bay.id,
    disabled: !sortable || isSaving
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const handleStatusChange = async (checked: boolean) => {
    await onStatusChange(bay, checked);
  };

  // Define classes based on active status - enhanced with stronger colors
  const itemClassNames = bay.is_active
    ? `flex items-center justify-between p-3 mb-3 border rounded-lg shadow-sm bg-green-50 border-l-4 border-l-green-500 ${isDragging ? 'bg-blue-50 shadow-md' : ''}`
    : `flex items-center justify-between p-3 mb-3 border rounded-lg shadow-sm bg-red-50 border-l-4 border-l-red-500 ${isDragging ? 'bg-blue-50 shadow-md' : ''}`;
  
  return (
    <div 
      ref={sortable ? setNodeRef : undefined} 
      style={sortable ? style : undefined} 
      className={itemClassNames}
      {...(sortable ? attributes : {})} 
      {...(sortable ? listeners : {})}
    >
      <div className="flex items-center gap-3">
        {sortable && <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {bay.bay_name}
            </h3>
            {bay.is_active ? (
              <Badge variant="success" className="text-xs">Active</Badge>
            ) : (
              <Badge variant="danger" className="text-xs">Inactive</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            ${bay.hourly_rate.toFixed(2)}/hr · 
            ${bay.daily_rate ? bay.daily_rate.toFixed(2) : '0.00'}/day
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={bay.is_active}
          onCheckedChange={handleStatusChange}
          disabled={isSaving}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditClick(bay)}
          disabled={isSaving}
          className="text-blue-600 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHistoryClick(bay)}
          disabled={isSaving}
          className="text-purple-600 hover:bg-purple-50"
        >
          <History className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteClick(bay)}
          disabled={isSaving}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const CompactBayList: React.FC<CompactBayListProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  isSaving = false,
  sortable = false
}) => {
  return (
    <div className="space-y-2">
      {bays.map((bay) => (
        <SortableCompactBayItem
          key={bay.id}
          bay={bay}
          onStatusChange={onStatusChange}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onHistoryClick={onHistoryClick}
          isSaving={isSaving}
          sortable={sortable}
        />
      ))}
    </div>
  );
};
