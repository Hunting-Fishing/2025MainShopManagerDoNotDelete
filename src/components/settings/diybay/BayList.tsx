
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { BayCard } from "./BayCard";
import { BaysTable } from "./BaysTable";
import { CompactBayList } from "./CompactBayList";

interface BayListProps {
  bays: Bay[];
  viewMode: "table" | "cards" | "compact";
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
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  } else if (viewMode === "compact") {
    return (
      <CompactBayList
        bays={bays}
        onStatusChange={onStatusChange}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onHistoryClick={onHistoryClick}
      />
    );
  } else {
    return (
      <BaysTable
        bays={bays}
        onStatusChange={onStatusChange}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onHistoryClick={onHistoryClick}
        onRateChange={onRateChange}
      />
    );
  }
};
