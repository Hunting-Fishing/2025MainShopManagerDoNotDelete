
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText } from "lucide-react";
import { printElement } from "@/utils/printUtils";
import { useState } from "react";

interface CustomerPortalHeaderProps {
  customerName: string;
}

export function CustomerPortalHeader({ customerName }: CustomerPortalHeaderProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  const handlePrint = () => {
    if (activeTab) {
      printElement(`portal-${activeTab}`, `${customerName} - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`);
    } else {
      printElement('portal-content', `${customerName} - Customer Portal`);
    }
  };
  
  const handleDownloadServiceHistory = () => {
    // In a real implementation, this would generate and download 
    // a PDF or CSV of the customer's service history
    alert("This would download your complete service history as a PDF");
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {customerName}</h1>
        <p className="text-gray-600">Access your automotive service information</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleDownloadServiceHistory}
        >
          <Download className="h-4 w-4" />
          Download History
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Request Quote
        </Button>
      </div>
    </div>
  );
}
