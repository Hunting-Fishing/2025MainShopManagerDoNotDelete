
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedReport } from "@/types/reports";
import { toast } from "@/components/ui/use-toast";

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

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder="Monthly Sales Overview"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="report-description">Description (Optional)</Label>
            <Input
              id="report-description"
              placeholder="Sales data for the current month"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="schedule-report" 
              checked={scheduleReport}
              onCheckedChange={(checked) => setScheduleReport(checked === true)}
            />
            <Label htmlFor="schedule-report">Schedule this report</Label>
          </div>
          
          {scheduleReport && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="grid gap-2">
                <Label htmlFor="schedule-frequency">Frequency</Label>
                <select
                  id="schedule-frequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="schedule-email">Email</Label>
                <Input
                  id="schedule-email"
                  type="email"
                  placeholder="example@company.com"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {savedReports.length > 0 && (
            <div className="mt-4">
              <Label>Your Saved Reports</Label>
              <ScrollArea className="h-[200px] mt-2 border rounded-md p-4">
                <div className="space-y-4">
                  {savedReports.map((report) => (
                    <div key={report.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                          {report.scheduled && ` • Scheduled ${report.scheduled.frequency}`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            onLoadReport(report.id);
                            setIsOpen(false);
                          }}
                        >
                          Load
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => onDeleteReport(report.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
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
