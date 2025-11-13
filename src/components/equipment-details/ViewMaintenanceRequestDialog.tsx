import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, FileText, Package, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { PartsRequestManager } from '@/components/maintenance/PartsRequestManager';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-blue-500/10 text-blue-500',
  rejected: 'bg-red-500/10 text-red-500',
  in_progress: 'bg-purple-500/10 text-purple-500',
  completed: 'bg-green-500/10 text-green-500',
};

const priorityColors = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
};

interface ViewMaintenanceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onConvert: () => void;
  onRefetch: () => void;
}

export function ViewMaintenanceRequestDialog({ 
  open, 
  onOpenChange, 
  request,
  onConvert,
  onRefetch
}: ViewMaintenanceRequestDialogProps) {
  if (!request) return null;

  const parts = request.parts_requested || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{request.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Request #{request.request_number}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={priorityColors[request.priority as keyof typeof priorityColors]}>
                {request.priority}
              </Badge>
              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                {request.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {request.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {request.description}
              </p>
            </div>
          )}

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Requested By
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {request.requested_by_name || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Request Date
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {format(new Date(request.requested_at || request.created_at), 'MMM dd, yyyy')}
              </p>
            </div>

            {request.assigned_to_name && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Assigned To
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {request.assigned_to_name}
                </p>
              </div>
            )}

            {request.estimated_hours && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Estimated Hours
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {request.estimated_hours} hrs
                </p>
              </div>
            )}

            {request.estimated_cost && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  Estimated Cost
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  ${request.estimated_cost.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Parts Requested */}
          {parts.length > 0 && (
            <PartsRequestManager
              maintenanceRequestId={request.id}
              parts={parts}
              onUpdate={onRefetch}
              readOnly={request.status === 'completed' || request.status === 'rejected'}
            />
          )}

          {/* Issues Found */}
          {request.issues_found && Array.isArray(request.issues_found) && request.issues_found.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Issues Found
              </div>
              <ul className="list-disc list-inside pl-6 space-y-1">
                {request.issues_found.map((issue: any, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {typeof issue === 'string' ? issue : issue.description || JSON.stringify(issue)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Notes */}
          {request.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Additional Notes
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {request.notes}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {request.rejection_reason && (
            <div className="p-4 bg-destructive/10 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <FileText className="h-4 w-4" />
                Rejection Reason
              </div>
              <p className="text-sm text-destructive/90 pl-6">
                {request.rejection_reason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            
            {request.status === 'pending' && (
              <Button onClick={onConvert}>
                <Wrench className="h-4 w-4 mr-2" />
                Convert to Work Order
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
