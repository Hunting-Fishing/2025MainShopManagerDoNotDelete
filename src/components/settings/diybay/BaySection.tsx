
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { ViewModeToggle } from "./ViewModeToggle";
import { BayList } from "./BayList";
import { AddBayButton } from "./AddBayButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface BaySectionProps {
  bays: Bay[];
  viewMode: "table" | "cards" | "compact";
  setViewMode: (mode: "table" | "cards" | "compact") => void;
  isLoading: boolean;
  isSaving: boolean;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onAddBay: (bayName: string) => Promise<Bay | null>;
  onRateChange?: (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<void>;
}

export const BaySection: React.FC<BaySectionProps> = ({
  bays,
  viewMode,
  setViewMode,
  isLoading,
  isSaving,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onAddBay,
  onRateChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Available Bays</h3>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <AddBayButton onAddBay={onAddBay} isSaving={isSaving} />

      {isLoading ? (
        <div className="flex justify-center items-center h-40 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500">Loading bays...</p>
        </div>
      ) : bays.length === 0 ? (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">No bays found</AlertTitle>
          <AlertDescription className="text-amber-700">
            You haven't added any DIY bays yet. Click the "Add Bay" button to create your first bay.
          </AlertDescription>
        </Alert>
      ) : (
        <BayList
          bays={bays}
          viewMode={viewMode}
          onStatusChange={onStatusChange}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onHistoryClick={onHistoryClick}
          onRateChange={onRateChange}
        />
      )}
    </div>
  );
};
