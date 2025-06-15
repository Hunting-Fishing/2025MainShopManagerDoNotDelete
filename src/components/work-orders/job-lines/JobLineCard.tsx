import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, GripVertical } from 'lucide-react';
import { updateWorkOrderJobLine, deleteWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from 'sonner';
import { Draggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobLineEditDialog } from './JobLineEditDialog';
import { getWorkOrderTimeEntries, addTimeEntryToWorkOrder, updateTimeEntry } from '@/services/workOrder/workOrderTimeTrackingService';
import { Loader2, Check, X, Clock } from "lucide-react";
import { useEffect } from "react";
import { TimeEntry } from '@/types/workOrder';

interface JobLineCardProps {
  jobLine: import("@/types/jobLine").WorkOrderJobLine;
  onUpdate?: (jobLine: import("@/types/jobLine").WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  isEditMode?: boolean;
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  isEditMode,
}: JobLineCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: jobLine.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = async (updatedJobLine: import("@/types/jobLine").WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
  };

  const handleDelete = async () => {
    if (!jobLine.id) return;

    try {
      setIsDeleting(true);
      await deleteWorkOrderJobLine(jobLine.id);
      toast.success('Job line deleted successfully');
      onDelete?.(jobLine.id);
    } catch (error: any) {
      console.error('Error deleting job line:', error);
      toast.error('Failed to delete job line');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add new state for time tracking
  const [isTracking, setIsTracking] = useState(false);
  const [jobLineTimeEntry, setJobLineTimeEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current time entry for this job line
  useEffect(() => {
    fetchCurrentEntry();
    // eslint-disable-next-line
  }, [jobLine.id]);

  const fetchCurrentEntry = async () => {
    setIsLoading(true);
    try {
      const entries = await getWorkOrderTimeEntries(jobLine.work_order_id, jobLine.id);
      const active = entries.find(e => !e.end_time);
      setJobLineTimeEntry(active || null);
    } catch (e) {
      console.error(e);
      setJobLineTimeEntry(null);
    }
    setIsLoading(false);
  };

  // Handler to clock ON this job line
  const handleClockOn = async () => {
    setIsLoading(true);
    try {
      const userName = "Technician";
      const userId = "1";
      const now = new Date().toISOString();
      const newEntry = {
        employee_id: userId,
        employee_name: userName,
        job_line_id: jobLine.id,
        start_time: now,
        duration: 0,
        billable: true,
        notes: "",
        created_at: now
      };
      await addTimeEntryToWorkOrder(jobLine.work_order_id, newEntry);
      toast({ title: "Clocked On", description: "Tech clocked on for this job line." });
      fetchCurrentEntry();
    } catch (e) {
      toast({ title: "Clock On Failed", description: "Unable to clock on.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  // Handler to clock OFF this job line
  const handleClockOff = async () => {
    if (!jobLineTimeEntry) return;
    setIsLoading(true);
    try {
      const end = new Date().toISOString();
      const updates = {
        end_time: end,
        duration: (new Date(end).getTime() - new Date(jobLineTimeEntry.start_time).getTime()) / (1000 * 60),
        billable: true
      };
      await updateTimeEntry(jobLineTimeEntry.id, updates);
      toast({ title: "Clocked Off", description: "Tech clocked off for this job line." });
      fetchCurrentEntry();
    } catch (e) {
      toast({ title: "Clock Off Failed", description: "Unable to clock off.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div className="font-bold text-lg">{jobLine.name}</div>
        {isEditMode && (
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Add Time Tracking for this job line */}
      <div className="flex items-center gap-3 mt-2">
        <Clock className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">
          Tech Time:
        </span>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin ml-2 text-gray-500" />
        ) : jobLineTimeEntry ? (
          <>
            <span className="font-bold text-green-600">
              Clocked ON at: {new Date(jobLineTimeEntry.start_time).toLocaleTimeString()}
            </span>
            <Button size="sm" variant="destructive" onClick={handleClockOff} disabled={isLoading}>
              <X className="h-4 w-4 mr-1" />
              Clock Off
            </Button>
          </>
        ) : (
          <Button size="sm" variant="default" onClick={handleClockOn} disabled={isLoading}>
            <Check className="h-4 w-4 mr-1" />
            Clock On
          </Button>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {jobLine.description}
      </div>

      {isEditDialogOpen && (
        <JobLineEditDialog
          jobLine={jobLine}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
