
import { useState } from "react";
import { TimeEntry } from "@/types/workOrder";

export const useTimeEntryForm = (
  initialEntry: Partial<TimeEntry> | null,
  onSubmit: (entry: TimeEntry) => void,
  onCancel: () => void
) => {
  const [formData, setFormData] = useState<Partial<TimeEntry>>({
    employee_id: initialEntry?.employee_id || "",
    employee_name: initialEntry?.employee_name || "",
    start_time: initialEntry?.start_time || "",
    end_time: initialEntry?.end_time || "",
    duration: initialEntry?.duration || 0,
    billable: initialEntry?.billable ?? true,
    notes: initialEntry?.notes || "",
    work_order_id: initialEntry?.work_order_id || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof TimeEntry, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return;
    
    try {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins > 0) {
        handleChange("duration", diffMins);
      } else {
        setErrors(prev => ({
          ...prev,
          end_time: "End time must be after start time"
        }));
      }
    } catch (error) {
      console.error("Error calculating duration:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employee_id) {
      newErrors.employee_id = "Staff member is required";
    }
    
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = "Duration must be positive";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        id: initialEntry?.id || crypto.randomUUID(),
        employee_id: formData.employee_id!,
        employee_name: formData.employee_name!,
        start_time: formData.start_time!,
        end_time: formData.end_time,
        duration: formData.duration || 0,
        billable: formData.billable || false,
        notes: formData.notes,
        work_order_id: formData.work_order_id!
      });
    }
  };

  return {
    formData,
    errors,
    handleChange,
    calculateDuration,
    handleSubmit,
    handleCancel: onCancel
  };
};
