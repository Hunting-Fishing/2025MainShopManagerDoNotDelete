
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/lib/formatters";
import { Switch } from "@/components/ui/switch";
import { Edit2, Clock, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CompactBayListProps {
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
    <div className="space-y-3">
      {bays.map((bay) => (
        <Card key={bay.id} className="overflow-hidden bg-white border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-4">
              <div className="min-w-[40px] h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-md font-bold">
                {bay.bay_name.charAt(0)}
              </div>
              
              <div>
                <h3 className="font-medium">{bay.bay_name}</h3>
                {bay.bay_location && (
                  <p className="text-xs text-gray-500">{bay.bay_location}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex gap-6 items-center">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Hourly</div>
                  <div className="font-semibold">{formatCurrency(bay.hourly_rate)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Daily</div>
                  <div className="font-semibold">{bay.daily_rate ? formatCurrency(bay.daily_rate) : "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={bay.is_active}
                    onCheckedChange={(checked) => onStatusChange(bay, checked)}
                    disabled={isSaving}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                  <span className="text-xs font-medium text-gray-500">
                    {bay.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full text-indigo-700 hover:bg-indigo-50"
                    onClick={() => onHistoryClick(bay)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    <span className="sr-only">View History</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full text-indigo-700 hover:bg-indigo-50"
                    onClick={() => onEditClick(bay)}
                    disabled={isSaving}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteClick(bay)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
