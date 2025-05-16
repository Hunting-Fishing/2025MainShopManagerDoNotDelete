
import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, RotateCw, Wrench, FileText, Calendar } from 'lucide-react';
import { Equipment } from '@/types/equipment';
import { WorkOrderPriorityType, WorkOrderTypes } from '@/types/workOrder';

interface EquipmentActionButtonsProps {
  equipment: Equipment;
  onScheduleMaintenance: () => void;
  onCreateWorkOrder: (type: string, priority: string) => void;
}

export const EquipmentActionButtons: React.FC<EquipmentActionButtonsProps> = ({
  equipment,
  onScheduleMaintenance,
  onCreateWorkOrder,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateWorkOrder = (type: string, priority: string) => {
    onCreateWorkOrder(type, priority);
    setIsOpen(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <Button 
        variant="outline"
        size="sm" 
        onClick={() => navigate(`/equipment/${equipment.id}/maintenance-history`)}
        className="flex items-center gap-1"
      >
        <RotateCw className="h-4 w-4" />
        <span>View History</span>
      </Button>
      
      <Button
        size="sm"
        onClick={onScheduleMaintenance}
        className="flex items-center gap-1"
      >
        <Calendar className="h-4 w-4" />
        <span>Schedule Maintenance</span>
      </Button>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Wrench className="h-4 w-4" />
            <span>Create Work Order</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleCreateWorkOrder(WorkOrderTypes.REPAIR, 'medium')}>
            <Wrench className="h-4 w-4 mr-2" />
            <span>Repair Order</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCreateWorkOrder(WorkOrderTypes.MAINTENANCE, 'low')}>
            <RotateCw className="h-4 w-4 mr-2" />
            <span>Maintenance Order</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCreateWorkOrder(WorkOrderTypes.INSPECTION, 'medium')}>
            <FileText className="h-4 w-4 mr-2" />
            <span>Inspection Order</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
