
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceTemplate } from '@/types/invoice';

interface InvoiceTemplateSelectorProps {
  templates: InvoiceTemplate[];
  onApplyTemplate: (template: InvoiceTemplate) => void;
  onSaveAsTemplate: () => void;
}

export function InvoiceTemplateSelector({
  templates,
  onApplyTemplate,
  onSaveAsTemplate
}: InvoiceTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onApplyTemplate(template);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="template-select">Apply Template</Label>
        <div className="flex gap-2 mt-1.5">
          <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
            <SelectTrigger id="template-select" className="flex-1">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={onSaveAsTemplate}>
            Save As Template
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceTemplateSelector;
