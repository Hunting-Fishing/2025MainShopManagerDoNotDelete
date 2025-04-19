
import { Button } from "@/components/ui/button";

interface FlowTypeSelectorProps {
  selectedWorkflow: string;
  onSelect: (id: string) => void;
}

const workflowTypes = [
  { id: 'customer-onboarding', name: 'Customer Onboarding' },
  { id: 'service-request', name: 'Service Request' },
  { id: 'maintenance', name: 'Maintenance Schedule' },
];

export function FlowTypeSelector({ selectedWorkflow, onSelect }: FlowTypeSelectorProps) {
  return (
    <div className="flex gap-4 mb-4">
      {workflowTypes.map((workflow) => (
        <Button
          key={workflow.id}
          variant={selectedWorkflow === workflow.id ? "default" : "outline"}
          onClick={() => onSelect(workflow.id)}
          className="rounded-full"
        >
          {workflow.name}
        </Button>
      ))}
    </div>
  );
}
