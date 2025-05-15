
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, X, Edit, History, Trash2, Loader2 } from "lucide-react";

export interface CompactBayListProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
  sortable?: boolean;
}

// A sortable item component
const SortableBayItem = ({ bay, onStatusChange, onEditClick, onDeleteClick, onHistoryClick, isSaving = false }) => {
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
      className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
        isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200 shadow-sm'
      } hover:shadow-md transition-shadow mb-2`}
    >
      <div className="flex items-center gap-2">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{bay.bay_name}</h3>
          {bay.bay_location && (
            <p className="text-sm text-gray-500">{bay.bay_location}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          bay.is_active 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {bay.is_active ? 'Active' : 'Inactive'}
        </span>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditClick(bay)}
            disabled={isSaving}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onHistoryClick(bay)}
            disabled={isSaving}
            className="p-1 text-purple-600 hover:text-purple-800"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteClick(bay)}
            disabled={isSaving}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Non-sortable version of the item
const BayItem = ({ bay, onStatusChange, onEditClick, onDeleteClick, onHistoryClick, isSaving = false }) => {
  return (
    <div 
      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-2"
    >
      <div>
        <h3 className="font-medium text-gray-900">{bay.bay_name}</h3>
        {bay.bay_location && (
          <p className="text-sm text-gray-500">{bay.bay_location}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          bay.is_active 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {bay.is_active ? 'Active' : 'Inactive'}
        </span>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditClick(bay)}
            disabled={isSaving}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onHistoryClick(bay)}
            disabled={isSaving}
            className="p-1 text-purple-600 hover:text-purple-800"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteClick(bay)}
            disabled={isSaving}
            className="p-1 text-red-600 hover:text-red-800"
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
  sortable = false,
}) => {
  return (
    <div className="space-y-2">
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
          />
        )
      ))}
    </div>
  );
};
