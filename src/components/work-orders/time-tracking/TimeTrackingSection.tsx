import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { TimeEntryForm } from "./TimeEntryForm";
import { useTimeEntryForm } from "./hooks/useTimeEntryForm";
import { TimeEntry } from "@/types/workOrder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

interface TimeTrackingSectionProps {
  workOrderId: string | undefined;
  existingEntries: TimeEntry[];
  onTimeEntriesChange: (entries: TimeEntry[]) => void;
}

export function TimeTrackingSection({
  workOrderId,
  existingEntries,
  onTimeEntriesChange,
}: TimeTrackingSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(existingEntries);

  useEffect(() => {
    setTimeEntries(existingEntries);
  }, [existingEntries]);

  const {
    values: formValues,
    error: formError,
    handleChange: handleFormChange,
    handleSave: handleFormSave,
    onCancel: handleFormCancel,
    resetForm,
  } = useTimeEntryForm({
    workOrderId: workOrderId || "",
    onSave: async (newEntry: TimeEntry) => {
      if (editingEntry) {
        // Update existing entry
        const updatedEntries = timeEntries.map((entry) =>
          entry.id === editingEntry.id ? newEntry : entry
        );
        setTimeEntries(updatedEntries);
        onTimeEntriesChange(updatedEntries);
        toast({
          title: "Time entry updated",
          description: "The time entry has been successfully updated.",
        });
      } else {
        // Add new entry
        const updatedEntries = [...timeEntries, newEntry];
        setTimeEntries(updatedEntries);
        onTimeEntriesChange(updatedEntries);
        toast({
          title: "Time entry created",
          description: "The time entry has been successfully created.",
        });
      }
      setIsFormOpen(false);
      setEditingEntry(null);
    },
  });

  const createTimeEntry = async () => {
    if (!workOrderId) return;

    try {
      const newEntry = {
        work_order_id: workOrderId,
        employee_id: formValues.employeeId,
        employee_name: formValues.employeeName,
        start_time: formValues.startTime,
        end_time: formValues.endTime,
        duration: formValues.duration,
        billable: formValues.billable,
        notes: formValues.notes,
      };

      formValues.onSave(newEntry as TimeEntry);
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating time entry:", error);
      toast({
        title: "Error",
        description: "Failed to create time entry.",
        variant: "destructive",
      });
    }
  };

  const editTimeEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      const updatedEntries = timeEntries.filter((entry) => entry.id !== id);
      setTimeEntries(updatedEntries);
      onTimeEntriesChange(updatedEntries);
      toast({
        title: "Time entry deleted",
        description: "The time entry has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete time entry.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Time Tracking</CardTitle>
        <Button size="sm" onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen ? (
          <TimeEntryForm
            values={formValues}
            error={formError}
            handleChange={handleFormChange}
            handleSave={createTimeEntry}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingEntry(null);
              handleFormCancel();
            }}
          />
        ) : (
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4">
              {timeEntries.length === 0 ? (
                <div className="text-center text-slate-500">No time entries yet.</div>
              ) : (
                <div className="space-y-2">
                  {timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{entry.employeeName}</p>
                        <p className="text-sm text-slate-500">
                          {entry.startTime} - {entry.endTime} ({entry.duration} minutes)
                        </p>
                        {entry.notes && <p className="text-sm text-slate-500">{entry.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editTimeEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTimeEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
