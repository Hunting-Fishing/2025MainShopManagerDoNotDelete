
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bay } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/lib/formatters";
import { Switch } from "@/components/ui/switch";

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
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="bg-muted/20 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {bay.bay_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {bay.is_active ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={bay.is_active}
              onCheckedChange={(checked) => onStatusChange(bay, checked)}
              aria-label="Toggle bay status"
            />
          </div>
        </div>
        {bay.bay_location && (
          <p className="text-sm text-muted-foreground mt-1">
            Location: {bay.bay_location}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Hourly Rate
            </h4>
            <p className="text-2xl font-bold">{formatCurrency(bay.hourly_rate)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Daily Rate
            </h4>
            <p className="text-2xl font-bold">
              {bay.daily_rate ? formatCurrency(bay.daily_rate) : "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Weekly Rate
            </h4>
            <p className="text-xl font-bold">
              {bay.weekly_rate ? formatCurrency(bay.weekly_rate) : "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Monthly Rate
            </h4>
            <p className="text-xl font-bold">
              {bay.monthly_rate ? formatCurrency(bay.monthly_rate) : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onHistoryClick(bay)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            History
          </button>
          <button
            onClick={() => onEditClick(bay)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteClick(bay)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
