
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CommunicationTemplate {
  id: string;
  name: string;
  type: "email" | "phone" | "text" | "in-person";
  subject?: string;
  content: string;
}

// Sample templates - in a real app, these would come from the database
const templates: CommunicationTemplate[] = [
  {
    id: "1",
    name: "Service Follow-up",
    type: "email",
    subject: "Following up on your recent service",
    content: "Dear customer,\n\nI wanted to follow up regarding your recent service with us. Is everything working to your satisfaction? Please let us know if you have any questions or concerns.\n\nBest regards,"
  },
  {
    id: "2",
    name: "Appointment Reminder",
    type: "text",
    content: "Hi there! This is a reminder about your upcoming appointment with us on [DATE]. Please reply to confirm or reschedule."
  },
  {
    id: "3",
    name: "Service Quote",
    type: "email",
    subject: "Your service quote",
    content: "Dear customer,\n\nThank you for contacting us about your service needs. Based on our discussion, we're providing the following quote:\n\n[QUOTE DETAILS]\n\nPlease let us know if you have any questions or if you'd like to proceed with scheduling.\n\nBest regards,"
  },
  {
    id: "4",
    name: "Phone Call Notes",
    type: "phone",
    content: "Called customer to discuss:\n- Current service status\n- Upcoming maintenance needs\n- Scheduling options\n\nAction items:"
  }
];

interface CommunicationTemplateSelectorProps {
  onTemplateSelect: (id: string, name: string, content: string, subject?: string) => void;
  type: string;
  setType: (type: any) => void;
}

export const CommunicationTemplateSelector: React.FC<CommunicationTemplateSelectorProps> = ({
  onTemplateSelect,
  type,
  setType
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  // Filter templates by the selected type
  const filteredTemplates = templates.filter(template => 
    type === "all" || template.type === type
  );

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setSelectedTemplateId("");
  };

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setSelectedTemplateId(templateId);
      onTemplateSelect(
        selectedTemplate.id,
        selectedTemplate.name,
        selectedTemplate.content,
        selectedTemplate.subject
      );
      
      // Ensure the type matches the template
      if (selectedTemplate.type !== type) {
        setType(selectedTemplate.type);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-type">Communication Type</Label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="in-person">In-person</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Select a Template</Label>
        {filteredTemplates.length > 0 ? (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id}
                className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                  selectedTemplateId === template.id ? "border-primary ring-1 ring-primary" : ""
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="font-medium">{template.name}</div>
                {template.subject && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Subject: {template.subject}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {template.content.substring(0, 60)}...
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No templates available for this communication type.
          </div>
        )}
      </div>
    </div>
  );
};
