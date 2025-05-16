
import { InvoiceTemplate } from "@/types/invoice";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceTemplateSelectorProps {
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateSelector({
  templates,
  onSelectTemplate,
}: InvoiceTemplateSelectorProps) {
  const handleSelectTemplate = (templateId: string) => {
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  if (!templates || templates.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No templates available. Create a new one to save time in the future.
      </div>
    );
  }

  return (
    <div className="min-w-[200px]">
      <Select onValueChange={handleSelectTemplate}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Templates</SelectLabel>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
