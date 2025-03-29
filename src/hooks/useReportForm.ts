
import { useState } from "react";
import { SavedReport } from "@/types/reports";
import { toast } from "@/components/ui/use-toast";

interface UseReportFormProps {
  currentReport: {
    title: string;
    type: string;
    filters: Record<string, any>;
  };
  onSaveReport: (report: SavedReport) => void;
}

export function useReportForm({ currentReport, onSaveReport }: UseReportFormProps) {
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [scheduleReport, setScheduleReport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly");
  const [scheduleEmail, setScheduleEmail] = useState("");

  const handleSaveReport = () => {
    if (!reportName) {
      toast({
        title: "Report name required",
        description: "Please provide a name for your report",
        variant: "destructive"
      });
      return;
    }

    const newReport: SavedReport = {
      id: `report-${Date.now()}`,
      name: reportName,
      description: reportDescription,
      type: currentReport.type,
      filters: currentReport.filters,
      createdAt: new Date().toISOString(),
      scheduled: scheduleReport ? {
        frequency: scheduleFrequency,
        email: scheduleEmail,
      } : undefined
    };

    onSaveReport(newReport);
    resetForm();
    
    toast({
      title: "Report saved",
      description: scheduleReport 
        ? `Report "${reportName}" saved and scheduled for ${scheduleFrequency} delivery` 
        : `Report "${reportName}" saved successfully`
    });
    
    return true;
  };

  const resetForm = () => {
    setReportName("");
    setReportDescription("");
    setScheduleReport(false);
    setScheduleFrequency("weekly");
    setScheduleEmail("");
  };

  return {
    formState: {
      reportName,
      reportDescription,
      scheduleReport,
      scheduleFrequency,
      scheduleEmail
    },
    formActions: {
      setReportName,
      setReportDescription,
      setScheduleReport,
      setScheduleFrequency,
      setScheduleEmail,
      handleSaveReport,
      resetForm
    }
  };
}
