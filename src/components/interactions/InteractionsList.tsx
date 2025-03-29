
import React, { useState } from "react";
import { CustomerInteraction, InteractionType } from "@/types/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractionTypeBadge } from "./InteractionTypeBadge";
import { InteractionStatusBadge } from "./InteractionStatusBadge";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  ChevronRight, 
  Clock, 
  Filter, 
  MoreHorizontal, 
  UserRound 
} from "lucide-react";
import { InteractionDetailsDialog } from "./InteractionDetailsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { completeFollowUp } from "@/data/interactionsData";
import { toast } from "@/hooks/use-toast";

interface InteractionsListProps {
  interactions: CustomerInteraction[];
  title?: string;
  showFilters?: boolean;
}

export const InteractionsList: React.FC<InteractionsListProps> = ({ 
  interactions,
  title = "Interaction History",
  showFilters = true
}) => {
  const [filteredType, setFilteredType] = useState<InteractionType | "all">("all");
  const [selectedInteraction, setSelectedInteraction] = useState<CustomerInteraction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter interactions by type
  const filteredInteractions = filteredType === "all" 
    ? interactions 
    : interactions.filter(interaction => interaction.type === filteredType);

  // Handle marking a follow-up as complete
  const handleCompleteFollowUp = (interaction: CustomerInteraction) => {
    if (interaction.type === "follow_up" && !interaction.followUpCompleted) {
      const updated = completeFollowUp(interaction.id);
      if (updated) {
        toast({
          title: "Follow-up completed",
          description: "The follow-up has been marked as completed.",
        });
      }
    }
  };

  // View interaction details
  const viewInteractionDetails = (interaction: CustomerInteraction) => {
    setSelectedInteraction(interaction);
    setIsDetailsOpen(true);
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showFilters && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select 
                value={filteredType} 
                onValueChange={(value) => setFilteredType(value as InteractionType | "all")}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interactions</SelectItem>
                  <SelectItem value="work_order">Work Orders</SelectItem>
                  <SelectItem value="communication">Communications</SelectItem>
                  <SelectItem value="parts">Parts</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="follow_up">Follow-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No interaction history found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredInteractions.map((interaction) => (
              <div key={interaction.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <InteractionTypeBadge type={interaction.type} />
                      <InteractionStatusBadge status={interaction.status} />
                      {interaction.type === "follow_up" && interaction.followUpDate && !interaction.followUpCompleted && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Follow-up due: {new Date(interaction.followUpDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium">{interaction.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <div className="flex items-center">
                        <UserRound className="h-3.5 w-3.5 mr-1" />
                        <span>{interaction.staffMemberName}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                        <span>{new Date(interaction.date).toLocaleDateString()}</span>
                      </div>
                      {interaction.relatedWorkOrderId && (
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>WO: {interaction.relatedWorkOrderId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewInteractionDetails(interaction)}
                    >
                      Details
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {interaction.relatedWorkOrderId && (
                          <DropdownMenuItem asChild>
                            <Link to={`/work-orders/${interaction.relatedWorkOrderId}`}>
                              View Work Order
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {interaction.type === "follow_up" && !interaction.followUpCompleted && (
                          <DropdownMenuItem onClick={() => handleCompleteFollowUp(interaction)}>
                            Mark Follow-up Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/customers/${interaction.customerId}`}>
                            View Customer
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {selectedInteraction && (
        <InteractionDetailsDialog
          interaction={selectedInteraction}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </Card>
  );
};
