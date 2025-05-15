
import React from "react";
import { Bay } from "@/services/diybay/diybayService";

export interface CompactBayListProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
}

export const CompactBayList: React.FC<CompactBayListProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  isSaving = false,
}) => {
  return (
    <div className="space-y-2">
      {bays.map((bay) => (
        <div 
          key={bay.id} 
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
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
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {bay.is_active ? 'Active' : 'Inactive'}
            </span>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEditClick(bay)}
                disabled={isSaving}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => onHistoryClick(bay)}
                disabled={isSaving}
                className="p-1 text-purple-600 hover:text-purple-800"
              >
                History
              </button>
              <button
                onClick={() => onDeleteClick(bay)}
                disabled={isSaving}
                className="p-1 text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
