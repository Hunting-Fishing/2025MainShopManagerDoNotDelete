
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bay } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/lib/formatters";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit2, Clock, Trash2, MapPin } from "lucide-react";

interface BayCardProps {
  bay: Bay;
  onStatusChange: (bay: Bay, isActive: boolean) => void;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => void;
}

export const BayCard: React.FC<BayCardProps> = ({
  bay,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
}) => {
  return (
    <Card className="mb-4 overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {bay.bay_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/90">
              {bay.is_active ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={bay.is_active}
              onCheckedChange={(checked) => onStatusChange(bay, checked)}
              className="data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
            />
          </div>
        </div>
        {bay.bay_location && (
          <p className="text-sm text-white/80 mt-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {bay.bay_location}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-4 bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-indigo-700 mb-1">
              Hourly Rate
            </h4>
            <p className="text-2xl font-bold text-indigo-900">{formatCurrency(bay.hourly_rate)}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-purple-700 mb-1">
              Daily Rate
            </h4>
            <p className="text-2xl font-bold text-purple-900">
              {bay.daily_rate ? formatCurrency(bay.daily_rate) : "N/A"}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-blue-700 mb-1">
              Weekly Rate
            </h4>
            <p className="text-xl font-bold text-blue-900">
              {bay.weekly_rate ? formatCurrency(bay.weekly_rate) : "N/A"}
            </p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-cyan-700 mb-1">
              Monthly Rate
            </h4>
            <p className="text-xl font-bold text-cyan-900">
              {bay.monthly_rate ? formatCurrency(bay.monthly_rate) : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onHistoryClick(bay)}
            className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Clock className="mr-1 h-4 w-4" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditClick(bay)}
            className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Edit2 className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteClick(bay)}
            className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
