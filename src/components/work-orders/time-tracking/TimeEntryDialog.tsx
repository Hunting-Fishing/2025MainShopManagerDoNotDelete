
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryForm } from "./TimeEntryForm";

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: TimeEntry) => void;
  entry?: TimeEntry;
  workOrderId: string;
}

export const TimeEntryDialog: React.FC<TimeEntryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  entry,
  workOrderId,
}) => {
  const [formData, setFormData] = React.useState<Partial<TimeEntry>>(
    entry || {
      work_order_id: workOrderId,
      employee_name: "",
      start_time: "",
      end_time: "",
      duration: 0,
      billable: true,
    }
  );
  
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else {
      setFormData({
        work_order_id: workOrderId,
        employee_name: "",
        start_time: "",
        end_time: "",
        duration: 0,
        billable: true,
      });
    }
  }, [entry, workOrderId]);

  const handleChange = (field: keyof TimeEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time).getTime();
      const end = new Date(formData.end_time).getTime();
      
      if (end > start) {
        const durationMs = end - start;
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        handleChange('duration', durationMinutes);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employee_name) {
      newErrors.employee_name = "Employee name is required";
    }
    
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    
    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }
    
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time).getTime();
      const end = new Date(formData.end_time).getTime();
      
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const timeEntry: TimeEntry = {
        id: entry?.id || `te-${Date.now()}`,
        work_order_id: workOrderId,
        employee_id: formData.employee_id || "",
        employee_name: formData.employee_name || "",
        start_time: formData.start_time || "",
        end_time: formData.end_time || "",
        duration: formData.duration || 0,
        billable: formData.billable !== undefined ? formData.billable : true,
        notes: formData.notes,
        created_at: entry?.created_at || new Date().toISOString(),
      };
      
      onSave(timeEntry);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Time Entry" : "Add Time Entry"}
          </DialogTitle>
        </DialogHeader>
        
        <TimeEntryForm
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          calculateDuration={calculateDuration}
          handleSubmit={handleSubmit}
          handleCancel={onClose}
          isEditing={!!entry}
        />
      </DialogContent>
    </Dialog>
  );
};
