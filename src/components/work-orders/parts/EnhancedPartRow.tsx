
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { partStatusMap } from '@/types/workOrderPart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedPartRowProps {
  part: WorkOrderPart;
  isEditMode?: boolean;
  onEdit?: (part: WorkOrderPart) => void;
  onDelete?: (partId: string) => void;
  colorIndex?: number;
}

export function EnhancedPartRow({ 
  part, 
  isEditMode = false,
  onEdit,
  onDelete,
  colorIndex
}: EnhancedPartRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusInfo = partStatusMap[part.status || 'pending'];
  const totalPrice = part.quantity * part.unit_price;
  const markupAmount = part.markupPercentage ? (part.unit_price * part.markupPercentage / 100) : 0;

  const handleEdit = () => {
    if (onEdit) onEdit(part);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this part?')) {
      onDelete(part.id);
    }
  };

  return (
    <>
      <TableRow colorIndex={colorIndex}>
        <TableCell className="w-8">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </TableCell>
        
        <TableCell>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{part.name}</span>
              {part.isStockItem && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Package className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>Stock Item</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {part.coreChargeApplied && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </TooltipTrigger>
                    <TooltipContent>Core Charge Applied</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{part.part_number}</span>
            {part.category && (
              <Badge variant="outline" className="text-xs w-fit mt-1">
                {part.category}
              </Badge>
            )}
          </div>
        </TableCell>
        
        <TableCell className="text-center">
          {part.quantity}
        </TableCell>
        
        <TableCell className="text-right">
          <div className="flex flex-col">
            <span className="font-medium">${part.unit_price.toFixed(2)}</span>
            {part.supplierCost && (
              <span className="text-xs text-muted-foreground">
                Cost: ${part.supplierCost.toFixed(2)}
              </span>
            )}
            {part.markupPercentage && (
              <span className="text-xs text-green-600">
                +{part.markupPercentage}%
              </span>
            )}
          </div>
        </TableCell>
        
        <TableCell className="text-right font-medium">
          <div className="flex flex-col">
            <span>${totalPrice.toFixed(2)}</span>
            {part.coreChargeAmount && (
              <span className="text-xs text-orange-600">
                +${part.coreChargeAmount} core
              </span>
            )}
          </div>
        </TableCell>
        
        <TableCell>
          <Badge 
            variant="outline" 
            className={statusInfo?.classes || 'bg-gray-100 text-gray-800'}
          >
            {statusInfo?.label || part.status || 'pending'}
          </Badge>
        </TableCell>
        
        {isEditMode && (
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
      
      <TableRow>
        <TableCell colSpan={isEditMode ? 7 : 6} className="p-0">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent>
              <div className="p-4 bg-slate-50 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Supplier Information */}
                  {part.supplierName && (
                    <div>
                      <h6 className="font-medium text-sm mb-1">Supplier</h6>
                      <p className="text-sm">{part.supplierName}</p>
                      {part.supplierCost && (
                        <p className="text-xs text-muted-foreground">
                          Cost: ${part.supplierCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Pricing Breakdown */}
                  <div>
                    <h6 className="font-medium text-sm mb-1">Pricing</h6>
                    <div className="text-sm space-y-1">
                      <div>Unit Price: ${part.unit_price.toFixed(2)}</div>
                      {part.markupPercentage && (
                        <div className="text-green-600">
                          Markup: {part.markupPercentage}% (+${markupAmount.toFixed(2)})
                        </div>
                      )}
                      {part.isTaxable && (
                        <div className="text-blue-600">Taxable</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Warranty Information */}
                  {part.warrantyDuration && (
                    <div>
                      <h6 className="font-medium text-sm mb-1">Warranty</h6>
                      <p className="text-sm">{part.warrantyDuration}</p>
                      {part.warrantyExpiryDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(part.warrantyExpiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Location Information */}
                  {(part.binLocation || part.warehouseLocation) && (
                    <div>
                      <h6 className="font-medium text-sm mb-1">Location</h6>
                      {part.warehouseLocation && (
                        <p className="text-sm">Warehouse: {part.warehouseLocation}</p>
                      )}
                      {part.binLocation && (
                        <p className="text-sm">Bin: {part.binLocation}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Installation Information */}
                  {(part.installDate || part.installedBy) && (
                    <div>
                      <h6 className="font-medium text-sm mb-1">Installation</h6>
                      {part.installDate && (
                        <p className="text-sm">Date: {new Date(part.installDate).toLocaleDateString()}</p>
                      )}
                      {part.installedBy && (
                        <p className="text-sm">By: {part.installedBy}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Core Charge Information */}
                  {part.coreChargeApplied && (
                    <div>
                      <h6 className="font-medium text-sm mb-1">Core Charge</h6>
                      <p className="text-sm text-orange-600">
                        ${part.coreChargeAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Description and Notes */}
                {(part.description || part.notes || part.notesInternal) && (
                  <div className="mt-4 pt-3 border-t">
                    {part.description && (
                      <div className="mb-2">
                        <h6 className="font-medium text-sm mb-1">Description</h6>
                        <p className="text-sm text-muted-foreground">{part.description}</p>
                      </div>
                    )}
                    {part.notes && (
                      <div className="mb-2">
                        <h6 className="font-medium text-sm mb-1">Notes</h6>
                        <p className="text-sm text-muted-foreground">{part.notes}</p>
                      </div>
                    )}
                    {part.notesInternal && (
                      <div>
                        <h6 className="font-medium text-sm mb-1">Internal Notes</h6>
                        <p className="text-sm text-muted-foreground">{part.notesInternal}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TableCell>
      </TableRow>
    </>
  );
}
