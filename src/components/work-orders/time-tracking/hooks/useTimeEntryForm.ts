import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface TimeEntryFormProps {
  workOrderId: string;
  entry?: any;
  onClose: () => void;
  onTimeEntryUpdated: () => void;
}

export const useTimeEntryForm = ({
  workOrderId,
  entry,
  onClose,
  onTimeEntryUpdated
}: TimeEntryFormProps) => {
  const { toast } = useToast();
  const [values, setValues] = useState({
    employeeId: '',
    employeeName: '',
    startTime: '',
    endTime: '',
    duration: 0,
    billable: true,
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setValues({
        employeeId: entry.employee_id || '',
        employeeName: entry.employee_name || '',
        startTime: entry.start_time || '',
        endTime: entry.end_time || '',
        duration: entry.duration || 0,
        billable: entry.billable || true,
        notes: entry.notes || '',
      });
    }
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const createTimeEntry = async () => {
    if (!workOrderId) return;

    try {
      const newEntry = {
        work_order_id: workOrderId,
        employee_id: values.employeeId,
        employee_name: values.employeeName,
        start_time: values.startTime,
        end_time: values.endTime,
        duration: values.duration,
        billable: values.billable,
        notes: values.notes,
      };

      const { data, error } = await supabase
        .from('work_order_time_entries')
        .insert([newEntry])
        .select();

      if (error) {
        console.error("Error creating time entry:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to create time entry",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Time entry created successfully",
      });
      onTimeEntryUpdated();
      onClose();
    } catch (error: any) {
      console.error("Unexpected error creating time entry:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Unexpected error creating time entry",
        variant: "destructive"
      });
    }
  };

  const updateTimeEntry = async () => {
    if (!entry.id) return;
    
    try {
      const updatedEntry = {
        id: entry.id,
        employee_id: values.employeeId,
        employee_name: values.employeeName,
        start_time: values.startTime,
        end_time: values.endTime,
        duration: values.duration,
        billable: values.billable,
        notes: values.notes,
      };

      const { data, error } = await supabase
        .from('work_order_time_entries')
        .update(updatedEntry)
        .eq('id', entry.id)
        .select();

      if (error) {
        console.error("Error updating time entry:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to update time entry",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });
      onTimeEntryUpdated();
      onClose();
    } catch (error: any) {
      console.error("Unexpected error updating time entry:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Unexpected error updating time entry",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    setError('');
    if (entry) {
      // Update existing entry
      updateTimeEntry();
    } else {
      // Create new entry
      createTimeEntry();
    }
  };

  return { values, error, handleChange, handleSave, onClose };
};
