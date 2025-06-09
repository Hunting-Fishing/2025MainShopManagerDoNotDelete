
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  DollarSign, 
  Shield, 
  Calendar, 
  User, 
  FileText, 
  Settings,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface EnhancedPartCardProps {
  part: WorkOrderPart;
  onEdit?: (part: WorkOrderPart) => void;
  onDelete?: (partId: string) => void;
  isEditMode?: boolean;
}

export function EnhancedPartCard({ 
  part, 
  onEdit, 
  onDelete, 
  isEditMode = false 
}: EnhancedPartCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const statusInfo = partStatusMap[part.status] || partStatusMap.ordered;
  const totalCost = part.customerPrice * part.quantity;
  const coreChargeTotal = part.coreChargeApplied ? part.coreChargeAmount * part.quantity : 0;
  const grandTotal = totalCost + coreChargeTotal;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'defective':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'backordered':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'received':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const isWarrantyExpiring = () => {
    if (!part.warrantyExpiryDate) return false;
    const expiryDate = new Date(part.warrantyExpiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-lg">{part.partName}</h4>
              {part.partNumber && (
                <Badge variant="outline" className="text-xs">
                  {part.partNumber}
                </Badge>
              )}
              {part.category && (
                <Badge variant="secondary" className="text-xs">
                  {part.category}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {getStatusIcon(part.status)}
                <Badge className={statusInfo.classes}>
                  {statusInfo.label}
                </Badge>
              </div>
              
              {part.supplierName && (
                <span>Supplier: {part.supplierName}</span>
              )}
              
              {!part.isTaxable && (
                <Badge variant="outline" className="text-xs">
                  Non-Taxable
                </Badge>
              )}
              
              {isWarrantyExpiring() && (
                <Badge variant="destructive" className="text-xs">
                  Warranty Expiring
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {isEditMode && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(part)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {isEditMode && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(part.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Basic Info */}
        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <span className="ml-1 font-medium">{part.quantity}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Unit Price:</span>
            <span className="ml-1 font-medium">${part.customerPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="ml-1 font-medium">${totalCost.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>
            <span className="ml-1 font-medium text-green-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Core Charge */}
        {part.coreChargeAmount > 0 && (
          <div className="flex items-center gap-2 text-sm mb-2">
            <DollarSign className="h-4 w-4 text-orange-600" />
            <span>Core Charge: ${part.coreChargeAmount.toFixed(2)}</span>
            {part.coreChargeApplied && (
              <Badge variant="outline" className="text-xs">Applied</Badge>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {showDetails && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              {/* Pricing Breakdown */}
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing Details
                </h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Supplier Cost:</span>
                    <div className="font-medium">${part.supplierCost.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Markup:</span>
                    <div className="font-medium">{part.markupPercentage}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retail Price:</span>
                    <div className="font-medium">${part.retailPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Warranty Info */}
              {part.warrantyDuration && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Warranty Information
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{part.warrantyDuration}</div>
                    </div>
                    {part.warrantyExpiryDate && (
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <div className="font-medium">
                          {format(new Date(part.warrantyExpiryDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Installation Info */}
              {(part.installDate || part.installedBy) && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Installation Details
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {part.installDate && (
                      <div>
                        <span className="text-muted-foreground">Install Date:</span>
                        <div className="font-medium">
                          {format(new Date(part.installDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    )}
                    {part.installedBy && (
                      <div>
                        <span className="text-muted-foreground">Installed By:</span>
                        <div className="font-medium">{part.installedBy}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Information */}
              {(part.invoiceNumber || part.poLine) && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Order Information
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {part.invoiceNumber && (
                      <div>
                        <span className="text-muted-foreground">Invoice #:</span>
                        <div className="font-medium">{part.invoiceNumber}</div>
                      </div>
                    )}
                    {part.poLine && (
                      <div>
                        <span className="text-muted-foreground">PO Line:</span>
                        <div className="font-medium">{part.poLine}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant={part.isStockItem ? "default" : "outline"}>
                  {part.isStockItem ? "Stock Item" : "Special Order"}
                </Badge>
                <Badge variant={part.isTaxable ? "default" : "outline"}>
                  {part.isTaxable ? "Taxable" : "Non-Taxable"}
                </Badge>
                <Badge variant="outline">
                  Added: {format(new Date(part.dateAdded), 'MMM dd')}
                </Badge>
              </div>

              {/* Notes */}
              {(part.notes || part.notesInternal) && (
                <div className="space-y-2">
                  {part.notes && (
                    <div>
                      <span className="text-muted-foreground text-sm">Customer Notes:</span>
                      <p className="text-sm mt-1">{part.notes}</p>
                    </div>
                  )}
                  {part.notesInternal && (
                    <div>
                      <span className="text-muted-foreground text-sm">Internal Notes:</span>
                      <p className="text-sm mt-1 italic">{part.notesInternal}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
