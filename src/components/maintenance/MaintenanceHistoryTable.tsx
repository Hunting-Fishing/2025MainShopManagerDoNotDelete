
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Equipment, MaintenanceRecord } from "@/types/equipment";
import { formatDate } from "@/utils/workOrders";

interface MaintenanceHistoryTableProps {
  equipment: Equipment[];
}

export function MaintenanceHistoryTable({ equipment }: MaintenanceHistoryTableProps) {
  // Flatten all maintenance records from all equipment
  const allMaintenanceRecords = equipment.flatMap(item => 
    (item.maintenanceHistory || []).map(record => ({
      ...record,
      equipmentName: item.name,
      equipmentId: item.id
    }))
  );

  // Sort by completion date (most recent first)
  const sortedRecords = allMaintenanceRecords.sort((a, b) => 
    new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
  );

  if (sortedRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Maintenance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium">No maintenance history</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Completed maintenance tasks will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Maintenance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.map((record, index) => (
              <TableRow key={`${record.equipmentId}-${index}`}>
                <TableCell className="font-medium">{record.equipmentName}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{formatDate(record.completedDate)}</TableCell>
                <TableCell>{record.technician || 'N/A'}</TableCell>
                <TableCell>{record.cost ? `$${record.cost.toFixed(2)}` : 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
