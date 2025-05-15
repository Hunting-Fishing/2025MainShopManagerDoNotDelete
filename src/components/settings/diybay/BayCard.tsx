
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Trash2, History, Loader2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BayCardProps {
  bay: Bay;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
  isDragging?: boolean;
}

export const BayCard: React.FC<BayCardProps> = ({
  bay,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  isSaving = false,
  isDragging = false,
}) => {
  const handleStatusChange = async (checked: boolean) => {
    await onStatusChange(bay, checked);
  };

  // Enhanced style based on bay status with more prominent colors
  const cardStyles = bay.is_active
    ? `overflow-hidden transition border-l-4 border-l-green-500 ${isDragging ? 'shadow-xl border-blue-400' : 'shadow hover:shadow-md'} mb-3`
    : `overflow-hidden transition border-l-4 border-l-red-500 ${isDragging ? 'shadow-xl border-blue-400' : 'shadow hover:shadow-md opacity-70 border-dashed'} mb-3`;

  // Define header background based on status
  const headerBgClass = bay.is_active 
    ? 'bg-green-50' 
    : 'bg-red-50';

  return (
    <Card className={cardStyles}>
      <CardHeader className={`pb-2 ${headerBgClass}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <div className="p-1 bg-gray-100 rounded-md flex items-center justify-center cursor-grab">
              <GripVertical className="h-5 w-5 text-gray-500" />
            </div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 ml-1">
              {bay.bay_name}
              {!bay.is_active && (
                <Badge variant="danger" className="text-xs">
                  Inactive
                </Badge>
              )}
              {bay.is_active && (
                <Badge variant="success" className="text-xs">
                  Active
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {bay.is_active ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={bay.is_active}
              onCheckedChange={handleStatusChange}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {bay.bay_location && (
          <p className="text-sm text-gray-600 mb-4">Location: {bay.bay_location}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold">Hourly Rate</p>
            <p className="text-lg font-bold">${bay.hourly_rate.toFixed(2)}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-semibold">Daily Rate</p>
            <p className="text-lg font-bold">
              ${bay.daily_rate ? bay.daily_rate.toFixed(2) : '0.00'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-600 font-semibold">Weekly Rate</p>
            <p className="text-lg font-bold">
              ${bay.weekly_rate ? bay.weekly_rate.toFixed(2) : '0.00'}
            </p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-600 font-semibold">Monthly Rate</p>
            <p className="text-lg font-bold">
              ${bay.monthly_rate ? bay.monthly_rate.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditClick(bay)}
          disabled={isSaving}
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
          Edit
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onHistoryClick(bay)}
          disabled={isSaving}
          className="text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <History className="h-4 w-4 mr-1" />}
          History
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteClick(bay)}
          disabled={isSaving}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
