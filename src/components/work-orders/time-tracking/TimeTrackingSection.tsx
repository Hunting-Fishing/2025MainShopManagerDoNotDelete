
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryTable } from "./TimeEntryTable";
import { TimeEntryForm } from "./TimeEntryForm";
import { PlusCircle } from "lucide-react";
import { useTimeEntryForm } from "./hooks/useTimeEntryForm";

export interface TimeTrackingSectionProps {
  workOrderId: string;
  entries: TimeEntry[];
  onUpdateEntries: (updatedEntries: TimeEntry[]) => void;
}

export function TimeTrackingSection({ workOrderId, entries, onUpdateEntries }: TimeTrackingSectionProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  const {
    values,
    error,
    handleChange,
    handleSave,
    resetForm,
    setInitialValues
  } = useTimeEntryForm({
    workOrderId,
    onSave: (newEntry) => {
      if (editingEntry) {
        // Update existing entry
        const updatedEntries = entries.map(entry => 
          entry.id === editingEntry.id ? { ...newEntry, id: entry.id } : entry
        );
        onUpdateEntries(updatedEntries);
      } else {
        // Add new entry
        onUpdateEntries([...entries, newEntry]);
      }
      setIsAddingEntry(false);
      setEditingEntry(null);
    }
  });
  
  const handleAddClick = () => {
    resetForm();
    setIsAddingEntry(true);
    setEditingEntry(null);
  };
  
  const handleEditEntry = (entry: TimeEntry) => {
    setInitialValues({
      employeeId: entry.employee_id || entry.employeeId || "",
      employeeName: entry.employeeName,
      startTime: entry.startTime,
      endTime: entry.endTime || "",
      duration: entry.duration,
      billable: entry.billable !== false,
      notes: entry.notes || ""
    });
    setEditingEntry(entry);
    setIsAddingEntry(true);
  };
  
  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    onUpdateEntries(updatedEntries);
  };
  
  const handleCancelForm = () => {
    setIsAddingEntry(false);
    setEditingEntry(null);
  };
  
  const totalBillableTime = entries
    .filter(entry => entry.billable !== false)
    .reduce((sum, entry) => sum + (entry.duration || 0), 0);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Time Tracking</CardTitle>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddClick}
            disabled={isAddingEntry}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Time Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingEntry ? (
          <TimeEntryForm
            values={values}
            error={error}
            handleChange={handleChange}
            handleSave={handleSave}
            onCancel={handleCancelForm}
          />
        ) : (
          <TimeEntryTable
            entries={entries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            totalBillableTime={totalBillableTime}
          />
        )}
      </CardContent>
    </Card>
  );
}
