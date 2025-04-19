
import { Button } from "@/components/ui/button";
import { Activity, UserRoundCheck, Wrench } from 'lucide-react';

interface FlowTypeSelectorProps {
  selectedWorkflow: string;
  onSelect: (id: string) => void;
}

const workflowTypes = [
  { 
    id: 'customer-onboarding', 
    name: 'Customer Onboarding', 
    icon: <UserRoundCheck className="h-4 w-4 mr-2" />,
    color: 'bg-blue-600'
  },
  { 
    id: 'service-request', 
    name: 'Service Request', 
    icon: <Activity className="h-4 w-4 mr-2" />,
    color: 'bg-indigo-600'
  },
  { 
    id: 'maintenance', 
    name: 'Maintenance Schedule', 
    icon: <Wrench className="h-4 w-4 mr-2" />,
    color: 'bg-purple-600'
  },
];

export function FlowTypeSelector({ selectedWorkflow, onSelect }: FlowTypeSelectorProps) {
  return (
    <div className="flex gap-4 mb-4">
      {workflowTypes.map((workflow) => (
        <Button
          key={workflow.id}
          variant={selectedWorkflow === workflow.id ? "default" : "outline"}
          onClick={() => onSelect(workflow.id)}
          className={`rounded-full ${selectedWorkflow === workflow.id ? workflow.color : ''}`}
        >
          {workflow.icon}
          {workflow.name}
        </Button>
      ))}
    </div>
  );
}
