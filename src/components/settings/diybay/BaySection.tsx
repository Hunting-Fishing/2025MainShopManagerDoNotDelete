
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { ViewModeToggle } from "./ViewModeToggle";
import { BayList } from "./BayList";
import { AddBayButton } from "./AddBayButton";

interface BaySectionProps {
  bays: Bay[];
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Bays</h3>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <AddBayButton onAddBay={onAddBay} isSaving={isSaving} />

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading bays...</p>
        </div>
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
