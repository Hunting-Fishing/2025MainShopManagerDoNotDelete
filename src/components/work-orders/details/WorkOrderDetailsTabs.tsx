
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Plus } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';
import { WorkOrderHeader } from './WorkOrderHeader';
import { WorkOrderCustomerInfo } from './WorkOrderCustomerInfo';
import { WorkOrderVehicleInfo } from './WorkOrderVehicleInfo';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (entries: TimeEntry[]) => void;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderDetailsTabs({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onJobLinesChange,
  onTimeEntriesChange,
  onWorkOrderUpdate,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    // This would typically update parts in the parent component
    console.log('Part update requested:', updatedPart);
  };

  const handlePartDelete = (partId: string) => {
    // This would typically delete the part in the parent component
    console.log('Part delete requested:', partId);
  };

  return (
    <div className="space-y-6">
      {/* Work Order Header */}
      <WorkOrderHeader 
        workOrder={workOrder}
        customer={customer}
        isEditMode={isEditMode}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="labor">Labor & Parts</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="notes">Notes & Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <WorkOrderCustomerInfo customer={customer} workOrder={workOrder} />
            
            {/* Vehicle Information */}
            <WorkOrderVehicleInfo workOrder={workOrder} />
            
            {/* Quick Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{jobLines.length}</div>
                    <div className="text-sm text-muted-foreground">Job Lines</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{allParts.length}</div>
                    <div className="text-sm text-muted-foreground">Parts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Estimated Hours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      ${(jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0) + 
                        allParts.reduce((sum, part) => sum + (part.quantity * part.unit_price), 0)).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Estimate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="labor" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Labor & Parts</CardTitle>
              {isEditMode && (
                <div className="flex gap-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job Line
                  </Button>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Part
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <UnifiedItemsTable
                jobLines={jobLines}
                allParts={allParts}
                onJobLineUpdate={handleJobLineUpdate}
                onJobLineDelete={handleJobLineDelete}
                onPartUpdate={handlePartUpdate}
                onPartDelete={handlePartDelete}
                isEditMode={isEditMode}
                showType="all"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Time tracking functionality will be implemented here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Notes and documents functionality will be implemented here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
