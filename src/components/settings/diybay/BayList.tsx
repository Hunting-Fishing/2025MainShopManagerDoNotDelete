
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { BaysTable } from "./BaysTable";
import { BayCard } from "./BayCard";

interface BayListProps {
  bays: Bay[];
  viewMode: "table" | "cards";
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<void>;
}

export const BayList: React.FC<BayListProps> = ({
  bays,
  viewMode,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onRateChange,
}) => {
  if (bays.length === 0) {
    return (
      <div className="bg-muted/20 p-8 rounded-lg text-center">
        <h4 className="text-lg font-medium mb-2">No bays found</h4>
        <p className="text-muted-foreground mb-4">
          You haven't added any DIY bays yet. Add your first bay to get started.
        </p>
      </div>
    );
  }

  return viewMode === "table" ? (
    <BaysTable
      bays={bays}
      onStatusChange={onStatusChange}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
      onHistoryClick={onHistoryClick}
      onRateChange={onRateChange}
    />
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bays.map((bay) => (
        <BayCard
          key={bay.id}
          bay={bay}
          onStatusChange={onStatusChange}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onHistoryClick={onHistoryClick}
        />
      ))}
    </div>
  );
};
