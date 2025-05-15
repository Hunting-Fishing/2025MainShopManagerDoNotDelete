
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { Edit, History, Trash2, Loader2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CompactBayListProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
  sortable?: boolean;
}

// Sortable Bay Item component
const SortableBayItem = ({ 
  bay, 
  onStatusChange, 
  onEditClick, 
  onDeleteClick, 
  onHistoryClick, 
  isSaving 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: bay.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      {...attributes} 
      {...listeners}
    >
      <BayItem 
        bay={bay} 
        onStatusChange={onStatusChange} 
        onEditClick={onEditClick} 
        onDeleteClick={onDeleteClick} 
        onHistoryClick={onHistoryClick} 
        isSaving={isSaving}
        isDragging={isDragging}
      />
    </div>
  );
};

// Individual Bay Item component
const BayItem = ({ 
  bay, 
  onStatusChange, 
  onEditClick, 
  onDeleteClick, 
  onHistoryClick, 
  isSaving,
  isDragging
}) => {
  // Style based on active status and index
  const rowStyles = bay.is_active 
    ? `flex items-center justify-between p-3 mb-2 rounded-lg bg-white border ${isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
    : `flex items-center justify-between p-3 mb-2 rounded-lg bg-white border-dashed border ${isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200 opacity-70'}`;

  return (
    <div className={rowStyles}>
      <div className="flex items-center">
        <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{bay.bay_name}</span>
            {!bay.is_active && (
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                Inactive
              </Badge>
            )}
          </div>
          {bay.bay_location && <span className="text-sm text-gray-500">{bay.bay_location}</span>}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center gap-4 mr-4">
          <div className="bg-blue-50 px-3 py-1 rounded-lg">
            <span className="text-xs text-blue-600 font-medium">Hourly:</span>
            <span className="text-sm font-bold ml-1">${bay.hourly_rate.toFixed(2)}</span>
          </div>
          <div className="bg-green-50 px-3 py-1 rounded-lg">
            <span className="text-xs text-green-600 font-medium">Daily:</span>
            <span className="text-sm font-bold ml-1">
              ${bay.daily_rate ? bay.daily_rate.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
        
        <Switch
          checked={bay.is_active}
          onCheckedChange={(checked) => onStatusChange(bay, checked)}
          disabled={isSaving}
          className="mr-2"
        />
        
        <div className="flex space-x-1">
          <button
            onClick={() => onEditClick(bay)}
            disabled={isSaving}
            className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
            title="Edit bay"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={async () => await onHistoryClick(bay)}
            disabled={isSaving}
            className="p-1 rounded-md text-purple-600 hover:bg-purple-50"
            title="View rate history"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteClick(bay)}
            disabled={isSaving}
            className="p-1 rounded-md text-red-600 hover:bg-red-50"
            title="Delete bay"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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
    <div className="space-y-1">
      {bays.map((bay) => (
        sortable ? (
          <SortableBayItem
            key={bay.id}
            bay={bay}
            onStatusChange={onStatusChange}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onHistoryClick={onHistoryClick}
            isSaving={isSaving}
          />
        ) : (
          <BayItem
            key={bay.id}
            bay={bay}
            onStatusChange={onStatusChange}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onHistoryClick={onHistoryClick}
            isSaving={isSaving}
            isDragging={false}
          />
        )
      ))}
    </div>
  );
};
