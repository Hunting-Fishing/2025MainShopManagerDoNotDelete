
import React from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { WorkOrderTemplate } from "@/types/workOrder";
import { WorkOrderTemplateItem } from "./WorkOrderTemplateItem";

interface WorkOrderTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  templates: WorkOrderTemplate[];
  onSelect: (template: WorkOrderTemplate) => void;
  onDelete?: (templateId: string) => void;
}

export function WorkOrderTemplateSelector({
  open,
  onClose,
  templates,
  onSelect,
  onDelete
}: WorkOrderTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleSelect = (template: WorkOrderTemplate) => {
    onSelect(template);
    onClose();
  };

  const handleDelete = (templateId: string) => {
    if (onDelete) {
      onDelete(templateId);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Select Work Order Template</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredTemplates.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No templates found. Try a different search term.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4">
            {filteredTemplates.map(template => (
              <WorkOrderTemplateItem
                key={template.id}
                template={template}
                onSelect={() => handleSelect(template)}
                onDelete={onDelete ? () => handleDelete(template.id) : undefined}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
