
import { useState } from "react";
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { InvoiceListTable } from "@/components/invoices/InvoiceListTable";
import { InvoiceListEmptyState } from "@/components/invoices/InvoiceListEmptyState";
import { InvoiceListExportMenu } from "@/components/invoices/InvoiceListExportMenu";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { format } from "date-fns";

export function InvoiceList() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { 
    invoices, 
    isLoading, 
    isError, 
    refetch,
    isRealTimeEnabled,
    setIsRealTimeEnabled
  } = useInvoiceData();

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  // If there's an error or no invoices, show the empty state
  if (isError || (!isLoading && (!invoices || invoices.length === 0))) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="relative"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated: {format(lastUpdated, "PPp")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
          >
            {isRealTimeEnabled ? "Disable" : "Enable"} Real-time Updates
          </Button>
        </div>
        
        <InvoiceListEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="relative"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated: {format(lastUpdated, "PPp")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
          >
            {isRealTimeEnabled ? "Disable" : "Enable"} Real-time
          </Button>
          
          {invoices && invoices.length > 0 && (
            <InvoiceListExportMenu invoices={invoices} />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
      ) : (
        <InvoiceListTable invoices={invoices} />
      )}
    </div>
  );
}
