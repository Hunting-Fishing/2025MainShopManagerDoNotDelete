
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// This would come from the Supabase database in a real implementation
const TEMPLATES = [
  {
    id: "1",
    name: "Service Follow-up",
    type: "email",
    subject: "Follow-up on your recent service",
    content: "Dear customer,\n\nThank you for bringing your vehicle in for service recently. We wanted to check if everything is working well and if you have any questions.\n\nBest regards,\nYour Service Team",
  },
  {
    id: "2",
    name: "Appointment Reminder",
    type: "email",
    subject: "Reminder: Your upcoming appointment",
    content: "Dear customer,\n\nThis is a friendly reminder about your upcoming service appointment. We look forward to seeing you soon.\n\nBest regards,\nYour Service Team",
  },
  {
    id: "3",
    name: "Service Reminder",
    type: "text",
    content: "Hi! Just a reminder that your vehicle is due for service. Please call us to schedule your appointment.",
  },
  {
    id: "4",
    name: "Thank You",
    type: "phone",
    content: "Thank you for your business. Discuss recent service work and ask if they have any questions.",
  },
];

interface CommunicationTemplateSelectorProps {
  onTemplateSelect: (id: string, name: string, content: string, subject?: string) => void;
  type: string;
  setType: (type: any) => void;
}

export const CommunicationTemplateSelector: React.FC<CommunicationTemplateSelectorProps> = ({
  onTemplateSelect,
  type,
  setType,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Filter templates by communication type
  const filteredTemplates = TEMPLATES.filter(template => 
    template.type === type || type === ""
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    setSelectedTemplateId(templateId);
    setType(template.type);
    onTemplateSelect(
      template.id, 
      template.name, 
      template.content, 
      template.subject
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Communication Type</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value)}
        >
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
        <Label>Select Template</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a template" />
          </SelectTrigger>
          <SelectContent>
            {filteredTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
