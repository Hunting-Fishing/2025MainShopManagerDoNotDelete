
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/formatters";
import { Clock, Edit2, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BayCardProps {
  bay: Bay;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving?: boolean;
}

export const BayCard: React.FC<BayCardProps> = ({
  bay,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  isSaving = false
}) => {
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full ${bay.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg">{bay.bay_name}</CardTitle>
          {bay.bay_location && <p className="text-sm text-gray-500">{bay.bay_location}</p>}
        </div>
        <Badge variant={bay.is_active ? "default" : "outline"}>
          {bay.is_active ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500">Hourly Rate</div>
            <div className="font-bold text-lg">{formatCurrency(bay.hourly_rate)}</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500">Daily Rate</div>
            <div className="font-bold text-lg">
              {bay.daily_rate ? formatCurrency(bay.daily_rate) : "—"}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500">Weekly Rate</div>
            <div className="font-bold text-lg">
              {bay.weekly_rate ? formatCurrency(bay.weekly_rate) : "—"}
            </div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500">Monthly Rate</div>
            <div className="font-bold text-lg">
              {bay.monthly_rate ? formatCurrency(bay.monthly_rate) : "—"}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={bay.is_active}
              onCheckedChange={(checked) => onStatusChange(bay, checked)}
              disabled={isSaving}
            />
            <span className="text-sm">{bay.is_active ? "Active" : "Inactive"}</span>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => onHistoryClick(bay)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              <span className="sr-only">History</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => onEditClick(bay)}
              disabled={isSaving}
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDeleteClick(bay)}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
