
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WorkOrderTemplate } from "@/types/workOrder";
import { WorkOrderTemplateItem } from "./WorkOrderTemplateItem";

interface WorkOrderTemplateSelectorProps {
  templates: WorkOrderTemplate[];
  onSelectTemplate: (template: WorkOrderTemplate) => void;
}

export function WorkOrderTemplateSelector({
  templates,
  onSelectTemplate,
}: WorkOrderTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (template: WorkOrderTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Use Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Work Order Templates</DialogTitle>
          <DialogDescription>
            Select a template to use for this work order.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-2">
          {filteredTemplates.length > 0 ? (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <WorkOrderTemplateItem
                  key={template.id}
                  template={template}
                  onSelect={() => handleSelect(template)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No templates found</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
