
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Package, DollarSign, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  isEditMode
}: PartsAndLaborTabProps) {
  // Calculate totals
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsCost = allParts.reduce((sum, part) => sum + part.total_price, 0);
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  
  // Get unlinked parts (parts not assigned to any job line)
  const unlinkedParts = allParts.filter(part => !part.job_line_id);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Labor Cost</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">${totalLaborCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-300">Parts Cost</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">${totalPartsCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Est. Hours</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{totalEstimatedHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Total Cost</p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">${(totalLaborCost + totalPartsCost).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines with Associated Parts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor & Associated Parts
            </CardTitle>
            {isEditMode && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Job Line
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No job lines added yet</p>
              {isEditMode && (
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Job Line
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobLines.map((jobLine) => {
                // Get parts linked to this job line
                const linkedParts = allParts.filter(part => part.job_line_id === jobLine.id);
                const jobLinePartsTotal = linkedParts.reduce((sum, part) => sum + part.total_price, 0);
                const jobLineTotal = (jobLine.total_amount || 0) + jobLinePartsTotal;

                return (
                  <Card key={jobLine.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="h-5 w-5 text-blue-500" />
                            <h4 className="font-semibold text-lg">{jobLine.name}</h4>
                            <Badge variant="outline" className="ml-2">
                              {jobLine.status || 'pending'}
                            </Badge>
                          </div>
                          {jobLine.description && (
                            <p className="text-sm text-muted-foreground mb-3">{jobLine.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Labor Details */}
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-4">
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Labor Details
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="font-medium ml-2">{jobLine.estimated_hours || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate:</span>
                            <span className="font-medium ml-2">${jobLine.labor_rate || 0}/hr</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Labor Cost:</span>
                            <span className="font-medium ml-2">${(jobLine.total_amount || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium ml-2">{jobLine.category || 'General'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Associated Parts */}
                      {linkedParts.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Associated Parts ({linkedParts.length})
                          </h5>
                          <div className="space-y-3">
                            {linkedParts.map((part) => (
                              <div key={part.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded border">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{part.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {part.status || 'pending'}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Part #: {part.part_number} | Qty: {part.quantity} | Unit: ${part.unit_price.toFixed(2)}
                                  </div>
                                  {part.description && (
                                    <div className="text-xs text-muted-foreground mt-1">{part.description}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-700 dark:text-green-300">
                                    ${part.total_price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-green-700 dark:text-green-300">Parts Subtotal:</span>
                              <span className="text-green-700 dark:text-green-300">${jobLinePartsTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Job Line Total */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-lg">Job Line Total:</span>
                          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                            ${jobLineTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Labor: ${(jobLine.total_amount || 0).toFixed(2)} + Parts: ${jobLinePartsTotal.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlinked Parts (if any) */}
      {unlinkedParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Unassigned Parts ({unlinkedParts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlinkedParts.map((part) => (
                <div key={part.id} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200 dark:border-orange-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{part.name}</span>
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                        Unassigned
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Part #: {part.part_number} | Qty: {part.quantity} | Unit: ${part.unit_price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-700 dark:text-orange-300">
                      ${part.total_price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
