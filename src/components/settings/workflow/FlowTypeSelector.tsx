
import { Button } from "@/components/ui/button";
import { UserRoundCheck, Activity, Wrench } from 'lucide-react';

interface FlowTypeSelectorProps {
  selectedWorkflow: string;
  onSelect: (id: string) => void;
}

const workflowTypes = [
  { 
    id: 'customer-onboarding', 
    name: 'Customer Onboarding', 
    icon: <UserRoundCheck className="h-4 w-4 mr-2" />,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    lightColor: 'bg-blue-50',
    lightBorder: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    id: 'service-request', 
    name: 'Service Request', 
    icon: <Activity className="h-4 w-4 mr-2" />,
    color: 'bg-indigo-600',
    hoverColor: 'hover:bg-indigo-700',
    lightColor: 'bg-indigo-50',
    lightBorder: 'border-indigo-200',
    textColor: 'text-indigo-700'
  },
  { 
    id: 'maintenance', 
    name: 'Maintenance Schedule', 
    icon: <Wrench className="h-4 w-4 mr-2" />,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    lightColor: 'bg-purple-50',
    lightBorder: 'border-purple-200',
    textColor: 'text-purple-700'
  },
];

export function FlowTypeSelector({ selectedWorkflow, onSelect }: FlowTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {workflowTypes.map((workflow) => (
        <Button
          key={workflow.id}
          variant={selectedWorkflow === workflow.id ? "default" : "outline"}
          onClick={() => onSelect(workflow.id)}
          className={`rounded-full px-4 py-2 transition-all ${
            selectedWorkflow === workflow.id 
              ? `${workflow.color} text-white ${workflow.hoverColor}` 
              : `${workflow.lightColor} ${workflow.textColor} border ${workflow.lightBorder} hover:bg-opacity-80`
          }`}
        >
          {workflow.icon}
          {workflow.name}
        </Button>
      ))}
    </div>
  );
}
