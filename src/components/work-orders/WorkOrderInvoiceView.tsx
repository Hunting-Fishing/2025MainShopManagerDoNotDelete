
import React, { useState } from "react";
import { WorkOrder } from "@/types/workOrder";
import { JobLinesGrid } from "./job-lines/JobLinesGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, User, Car, Calendar, Grid3X3, Table } from "lucide-react";

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceView({ workOrder }: WorkOrderInvoiceViewProps) {
  const [layoutMode, setLayoutMode] = useState<'cards' | 'table'>('cards');

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:max-w-none">
      {/* Invoice Header */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Service Invoice</CardTitle>
              <p className="text-muted-foreground">Work Order #{workOrder.id}</p>
            </div>
            <Badge variant={getStatusColor(workOrder.status)} className="text-sm">
              {workOrder.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Company Information
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{workOrder.company_name || "Auto Shop"}</div>
                <div>{workOrder.company_address || "123 Main Street"}</div>
                <div>{workOrder.company_city || "City"}, {workOrder.company_state || "State"} {workOrder.company_zip || "12345"}</div>
                <div>{workOrder.company_phone || "(555) 123-4567"}</div>
                <div>{workOrder.company_email || "info@autoshop.com"}</div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Customer Information
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{workOrder.customer_name || workOrder.customer || "Customer Name"}</div>
                <div>{workOrder.customer_address || "Customer Address"}</div>
                <div>{workOrder.customer_city || "City"}, {workOrder.customer_state || "State"} {workOrder.customer_zip || "ZIP"}</div>
                <div>{workOrder.customer_phone || "Phone"}</div>
                <div>{workOrder.customer_email || "Email"}</div>
              </div>
            </div>
          </div>

          {/* Vehicle & Service Information */}
          <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Car className="h-4 w-4" />
                Vehicle Information
              </div>
              <div className="text-sm space-y-1">
                <div>{workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</div>
                <div>VIN: {workOrder.vehicle_vin || "N/A"}</div>
                <div>License: {workOrder.vehicle_license_plate || "N/A"}</div>
                <div>Odometer: {workOrder.vehicle_odometer ? `${workOrder.vehicle_odometer} miles` : "N/A"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                Service Information
              </div>
              <div className="text-sm space-y-1">
                <div>Created: {formatDate(workOrder.created_at)}</div>
                <div>Start Date: {formatDate(workOrder.start_time)}</div>
                <div>Due Date: {formatDate(workOrder.due_date)}</div>
                <div>Technician: {workOrder.technician || "Unassigned"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Description */}
      {workOrder.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {workOrder.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Job Lines Section */}
      {workOrder.jobLines && workOrder.jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Service Details</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={layoutMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayoutMode('cards')}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={layoutMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLayoutMode('table')}
                >
                  <Table className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {layoutMode === 'cards' ? (
              <JobLinesGrid jobLines={workOrder.jobLines} showSummary={true} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Service/Part</th>
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-center py-2 font-medium">Labor Time</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrder.jobLines.map((jobLine) => (
                      <tr key={jobLine.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{jobLine.name}</div>
                          {jobLine.description && jobLine.description !== jobLine.name && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {jobLine.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3">
                          {jobLine.category && (
                            <Badge variant="outline" className="text-xs">
                              {jobLine.category}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {jobLine.estimatedHours ? `${jobLine.estimatedHours}h` : "—"}
                        </td>
                        <td className="py-3 text-right font-medium">
                          ${(jobLine.totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-semibold">
                      <td colSpan={2} className="py-3">Total</td>
                      <td className="py-3 text-center">
                        {workOrder.jobLines.reduce((sum, line) => sum + (line.estimatedHours || 0), 0).toFixed(1)}h
                      </td>
                      <td className="py-3 text-right">
                        ${workOrder.jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      {workOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {workOrder.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
