
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SavedReport } from "@/types/reports";
import { toast } from "@/components/ui/use-toast";
import { ReportForm } from "./ReportForm";
import { ReportsList } from "./ReportsList";

interface SavedReportsDialogProps {
  savedReports: SavedReport[];
  onSaveReport: (report: SavedReport) => void;
  onLoadReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  currentReport: {
    title: string;
    type: string;
    filters: Record<string, any>;
  };
}

export function SavedReportsDialog({
  savedReports,
  onSaveReport,
  onLoadReport,
  onDeleteReport,
  currentReport
}: SavedReportsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    
    toast({
      title: "Report saved",
      description: scheduleReport 
        ? `Report "${reportName}" saved and scheduled for ${scheduleFrequency} delivery` 
        : `Report "${reportName}" saved successfully`
    });
  };

  const resetForm = () => {
    setReportName("");
    setReportDescription("");
    setScheduleReport(false);
    setScheduleFrequency("weekly");
    setScheduleEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Saved Reports</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Saved Reports</DialogTitle>
          <DialogDescription>
            Save your current report configuration or load a previously saved report.
          </DialogDescription>
        </DialogHeader>

        <ReportForm
          reportName={reportName}
          reportDescription={reportDescription}
          scheduleReport={scheduleReport}
          scheduleFrequency={scheduleFrequency}
          scheduleEmail={scheduleEmail}
          setReportName={setReportName}
          setReportDescription={setReportDescription}
          setScheduleReport={setScheduleReport}
          setScheduleFrequency={setScheduleFrequency}
          setScheduleEmail={setScheduleEmail}
        />
        
        <ReportsList
          savedReports={savedReports}
          onLoadReport={onLoadReport}
          onDeleteReport={onDeleteReport}
          setIsOpen={setIsOpen}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveReport}>Save Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
