
import React, { useState } from "react";
import { TimeEntry } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntriesList } from "./TimeEntriesList";
import { useTimeEntryForm } from "./hooks/useTimeEntryForm";
import { TimeEntryForm } from "./TimeEntryForm";

interface TimeTrackingSectionProps {
  work_order_id: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (updatedEntries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  work_order_id,
  timeEntries,
  onUpdateTimeEntries
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  const {
    formData,
    errors,
    handleChange,
    calculateDuration,
    handleSubmit: submitTimeEntry,
    resetForm,
    setFormData
  } = useTimeEntryForm(work_order_id);

  const handleAddClick = () => {
    resetForm();
    setEditingEntryId(null);
    setShowForm(true);
  };

  const handleEditEntry = (entryId: string) => {
    const entry = timeEntries.find(e => e.id === entryId);
    if (entry) {
      setFormData({
        ...entry
      });
      setEditingEntryId(entryId);
      setShowForm(true);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    onUpdateTimeEntries(updatedEntries);
  };

  const handleSubmit = () => {
    if (editingEntryId) {
      // Update existing entry
      const updatedEntries = timeEntries.map(entry => 
        entry.id === editingEntryId ? { ...formData, id: editingEntryId } : entry
      );
      onUpdateTimeEntries(updatedEntries);
    } else {
      // Add new entry
      const newEntry: TimeEntry = {
        id: `te-${Date.now()}`,
        work_order_id,
        employee_id: formData.employee_id || '',
        employee_name: formData.employee_name || '',
        start_time: formData.start_time || '',
        end_time: formData.end_time || '',
        duration: formData.duration || 0,
        billable: formData.billable || true,
        notes: formData.notes || '',
        created_at: new Date().toISOString()
      };
      
      onUpdateTimeEntries([...timeEntries, newEntry]);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time Tracking</CardTitle>
        <Button onClick={handleAddClick}>Add Time Entry</Button>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <TimeEntryForm 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            calculateDuration={calculateDuration}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            isEditing={!!editingEntryId}
          />
        ) : (
          <TimeEntriesList 
            entries={timeEntries} 
            onEdit={handleEditEntry} 
            onDelete={handleDeleteEntry} 
          />
        )}
      </CardContent>
    </Card>
  );
}
