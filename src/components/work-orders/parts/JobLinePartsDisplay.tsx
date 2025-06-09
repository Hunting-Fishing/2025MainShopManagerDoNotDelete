
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Package, Eye, Trash2 } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { ViewPartDetailsDialog } from './ViewPartDetailsDialog';

interface JobLinePartsDisplayProps {
  parts: WorkOrderPart[];
  onRemovePart?: (partId: string) => void;
  isEditMode?: boolean;
}

export function JobLinePartsDisplay({ parts, onRemovePart, isEditMode = false }: JobLinePartsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);

  if (!parts || parts.length === 0) {
    return null;
  }

  const totalPartsValue = parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);

  return (
    <div className="mt-3 border-t pt-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Package className="h-4 w-4" />
              <span className="font-medium">Parts ({parts.length})</span>
              <Badge variant="outline" className="text-green-600">
                ${totalPartsValue.toFixed(2)}
              </Badge>
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-2 mt-2">
          {parts.map((part) => (
            <Card key={part.id} className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{part.partName}</h5>
                      <Badge variant="outline" className="text-xs">
                        {part.partType}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      {part.partNumber && (
                        <div>Part #: {part.partNumber}</div>
                      )}
                      <div className="flex gap-4">
                        <span>Qty: {part.quantity}</span>
                        <span>Price: ${part.customerPrice.toFixed(2)}</span>
                        <span>Total: ${(part.quantity * part.customerPrice).toFixed(2)}</span>
                      </div>
                      {part.supplierName && (
                        <div>Supplier: {part.supplierName}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPart(part)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isEditMode && onRemovePart && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemovePart(part.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CollapsibleContent>
      </Collapsible>
      
      {selectedPart && (
        <ViewPartDetailsDialog
          part={selectedPart}
          open={!!selectedPart}
          onOpenChange={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
}
