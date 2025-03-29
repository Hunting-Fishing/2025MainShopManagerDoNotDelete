
import React from "react";
import { CustomerInteraction } from "@/types/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InteractionTypeBadge } from "./InteractionTypeBadge";
import { InteractionStatusBadge } from "./InteractionStatusBadge";
import { format, parseISO } from "date-fns";
import { CalendarIcon, ClipboardList, Link as LinkIcon, User } from "lucide-react";
import { Link } from "react-router-dom";

interface InteractionDetailsDialogProps {
  interaction: CustomerInteraction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InteractionDetailsDialog: React.FC<InteractionDetailsDialogProps> = ({
  interaction,
  open,
  onOpenChange,
}) => {
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "PPP");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Interaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <InteractionTypeBadge type={interaction.type} />
            <InteractionStatusBadge status={interaction.status} />
          </div>

          <div>
            <h3 className="font-medium text-lg">{interaction.description}</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Staff Member</p>
                <p>{interaction.staffMemberName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Date</p>
                <p>{formatDate(interaction.date)}</p>
              </div>
            </div>

            {interaction.followUpDate && (
              <div className="flex items-start gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">Follow-up Date</p>
                  <p>{formatDate(interaction.followUpDate)}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Status: {interaction.followUpCompleted ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>
            )}

            {interaction.notes && (
              <div className="flex items-start gap-2">
                <ClipboardList className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">Notes</p>
                  <p className="whitespace-pre-wrap">{interaction.notes}</p>
                </div>
              </div>
            )}

            {interaction.relatedWorkOrderId && (
              <div className="flex items-start gap-2">
                <LinkIcon className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">Related Work Order</p>
                  <Link 
                    to={`/work-orders/${interaction.relatedWorkOrderId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {interaction.relatedWorkOrderId}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              {interaction.relatedWorkOrderId && (
                <Button asChild>
                  <Link to={`/work-orders/${interaction.relatedWorkOrderId}`}>
                    View Work Order
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
