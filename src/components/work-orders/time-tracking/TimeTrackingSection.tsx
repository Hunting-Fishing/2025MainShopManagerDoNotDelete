
import React, { useState } from "react";
import { TimeEntry, WorkOrder } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TimeEntriesList } from "./TimeEntriesList";
import { TimeEntryDialog } from "./TimeEntryDialog";
import { Card } from "@/components/ui/card";

interface TimeTrackingSectionProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onAddTimeEntry: (entry: TimeEntry) => void;
  onUpdateTimeEntry: (entry: TimeEntry) => void;
  onDeleteTimeEntry: (id: string) => void;
  isLoading?: boolean;
}

export function TimeTrackingSection({
  workOrder,
  timeEntries,
  onAddTimeEntry,
  onUpdateTimeEntry,
  onDeleteTimeEntry,
  isLoading = false
}: TimeTrackingSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const handleAddClick = () => {
    setEditingEntry(null);
    setShowAddDialog(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingEntry(null);
  };

  const handleSubmitEntry = (entry: TimeEntry) => {
    if (editingEntry) {
      onUpdateTimeEntry({
        ...entry,
        id: editingEntry.id
      });
    } else {
      onAddTimeEntry({
        ...entry,
        work_order_id: workOrder.id
      });
    }
    setShowAddDialog(false);
    setEditingEntry(null);
  };

  // Calculate total hours
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  // Calculate billable hours
  const totalBillableMinutes = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);
  const billableHours = Math.floor(totalBillableMinutes / 60);
  const billableMinutes = totalBillableMinutes % 60;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Time Tracking</h3>
          <p className="text-sm text-slate-500">
            Manage time entries for this work order
          </p>
        </div>
        <Button 
          onClick={handleAddClick}
          className="mt-2 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </div>

      <div className="mb-4 border-b pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-slate-600">Total Time</div>
            <div className="text-lg font-semibold text-blue-700">
              {`${totalHours}h ${remainingMinutes}m`}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-slate-600">Billable Time</div>
            <div className="text-lg font-semibold text-green-700">
              {`${billableHours}h ${billableMinutes}m`}
            </div>
          </div>
        </div>
      </div>

      <TimeEntriesList
        entries={timeEntries}
        onDelete={onDeleteTimeEntry}
        onEdit={handleEditEntry}
      />

      <TimeEntryDialog
        isOpen={showAddDialog}
        onClose={handleCloseDialog}
        initialEntry={{
          id: '',
          work_order_id: workOrder.id,
          employee_id: '',
          employee_name: '',
          start_time: '',
          duration: 0,
          billable: true
        }}
        existingEntry={editingEntry}
        onSubmit={handleSubmitEntry}
      />
    </Card>
  );
}
