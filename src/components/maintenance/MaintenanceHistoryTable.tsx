
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import type { EquipmentWithMaintenance } from "@/services/equipmentService";
import { formatDate } from "@/utils/workOrders";

interface MaintenanceHistoryTableProps {
  equipment: EquipmentWithMaintenance[];
}

export function MaintenanceHistoryTable({ equipment }: MaintenanceHistoryTableProps) {
  // For now, since we don't have maintenance history in the existing equipment table,
  // we'll show a placeholder. This can be updated when maintenance history is properly implemented
  const allMaintenanceRecords: any[] = [];

  // TODO: Once maintenance_history table is properly connected, this would fetch from there
  // equipment.flatMap(item => 
  //   (item.maintenance_history || []).map(record => ({
  //     ...record,
  //     equipmentName: item.name,
  //     equipmentId: item.id
  //   }))
  // );

  if (allMaintenanceRecords.length === 0) {
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
              Completed maintenance tasks will appear here. Connect your maintenance history data to see records.
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
            {allMaintenanceRecords.map((record, index) => (
              <TableRow key={`${record.equipmentId}-${index}`}>
                <TableCell className="font-medium">{record.equipmentName}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{formatDate(record.date)}</TableCell>
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
