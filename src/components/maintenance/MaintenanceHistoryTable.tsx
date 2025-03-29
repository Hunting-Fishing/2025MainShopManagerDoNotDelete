
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/workOrderUtils";
import { MaintenanceRecord } from "@/types/equipment";
import { Search, Clock, Download } from "lucide-react";
import { Parser } from "@json2csv/plainjs";
import { toast } from "@/hooks/use-toast";

interface MaintenanceHistoryTableProps {
  maintenanceHistory: Array<MaintenanceRecord & { equipmentName: string }>;
  timeframe: "upcoming" | "all";
  setTimeframe: (timeframe: "upcoming" | "all") => void;
}

export function MaintenanceHistoryTable({ 
  maintenanceHistory,
  timeframe,
  setTimeframe
}: MaintenanceHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter maintenance history based on search query and timeframe
  const filteredHistory = maintenanceHistory.filter(record => {
    const matchesSearch = 
      !searchQuery ||
      record.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const recordDate = new Date(record.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const matchesTimeframe = 
      timeframe === "all" || 
      (timeframe === "upcoming" && recordDate >= thirtyDaysAgo);
    
    return matchesSearch && matchesTimeframe;
  });

  const handleExportCSV = () => {
    try {
      // Format the data for export
      const dataToExport = filteredHistory.map(record => ({
        Equipment: record.equipmentName,
        Date: formatDate(record.date),
        Technician: record.technician,
        Description: record.description,
        Cost: record.cost ? `$${record.cost.toFixed(2)}` : 'N/A',
        Notes: record.notes || '',
        WorkOrder: record.workOrderId || ''
      }));
      
      // Generate CSV
      const parser = new Parser();
      const csv = parser.parse(dataToExport);
      
      // Create download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maintenance-history-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Maintenance history has been exported to CSV."
      });
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the maintenance history.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg">Maintenance History</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search history..."
                className="pl-8 w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Last 30 Days</SelectItem>
                <SelectItem value="all">All History</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No maintenance history found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {searchQuery ? `No results found for "${searchQuery}".` : `No maintenance history found for the ${timeframe === "upcoming" ? "last 30 days" : "selected timeframe"}.`}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record, index) => (
                <TableRow key={`${record.id}-${index}`}>
                  <TableCell className="font-medium">
                    {formatDate(record.date)}
                  </TableCell>
                  <TableCell>{record.equipmentName}</TableCell>
                  <TableCell>{record.technician}</TableCell>
                  <TableCell>
                    <div>
                      <div>{record.description}</div>
                      {record.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{record.notes}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {record.cost ? `$${record.cost.toFixed(2)}` : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
