
import React from "react";
import { Button } from "@/components/ui/button";
import { Bay } from "@/services/diybay/diybayService";
import { BayList } from "./BayList";
import { BaysTable } from "./BaysTable";
import { CompactBayList } from "./CompactBayList";
import { ViewModeToggle } from "./ViewModeToggle";
import { BayViewMode } from "@/types/diybay";
import { Loader2, Plus, Printer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { printElement } from "@/utils/printUtils";

interface BaySectionProps {
  bays: Bay[];
  viewMode: BayViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<BayViewMode>>;
  isLoading: boolean;
  isSaving: boolean;
  onAddBay: () => Promise<boolean>;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onRateChange: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onDragEnd?: (event: DragEndEvent) => void;
}

export const BaySection: React.FC<BaySectionProps> = ({
  bays,
  viewMode,
  setViewMode,
  isLoading,
  isSaving,
  onAddBay,
  onStatusChange,
  onRateChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onDragEnd,
}) => {
  // Set up drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handlePrint = () => {
    printElement("bays-content", "Available Bays");
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Available Bays</CardTitle>
          <div className="flex items-center gap-4">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button 
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              disabled={isLoading || bays.length === 0}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button 
              onClick={onAddBay} 
              disabled={isSaving || isLoading}
              size="sm"
              className="flex items-center gap-1"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add Bay
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div id="bays-content">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : bays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bays have been added yet. Click the "Add Bay" button to create your first bay.
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext 
                items={bays.map(bay => bay.id)} 
                strategy={verticalListSortingStrategy}
              >
                {viewMode === "table" ? (
                  <BaysTable 
                    bays={bays}
                    onStatusChange={onStatusChange}
                    onRateChange={onRateChange} 
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onHistoryClick={onHistoryClick}
                    isSaving={isSaving}
                  />
                ) : viewMode === "cards" ? (
                  <BayList 
                    bays={bays}
                    viewMode={viewMode}
                    onStatusChange={onStatusChange}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onHistoryClick={onHistoryClick}
                    isSaving={isSaving}
                    sortable={true}
                  />
                ) : (
                  <CompactBayList 
                    bays={bays}
                    onStatusChange={onStatusChange}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onHistoryClick={onHistoryClick}
                    isSaving={isSaving}
                    sortable={true}
                  />
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
