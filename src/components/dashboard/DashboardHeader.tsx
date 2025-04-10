
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          View your shop performance and metrics
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Last 30 Days
        </Button>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
}
