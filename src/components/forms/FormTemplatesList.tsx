// This file requires TypeScript fixes for the FormTemplate type

import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FormTemplate } from '@/types/form';

// Define or update the FormTemplate type to match what's expected
interface FormField {
  id: string;
  label: string;
  type: string; // Ensure this property exists
  fieldType?: string; // Optional if needed for backward compatibility
  required: boolean;
  placeholder?: string;
  displayOrder: number;
  validationRules?: any;
  // Add any other required fields
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  displayOrder: number;
  fields: FormField[];
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: {
    sections: FormSection[];
  };
  is_published?: boolean;
  version?: number;
  created_at?: string;
  // Add any other required fields
}

export function FormTemplatesList() {
  const formTemplates = [
    {
      id: "1",
      name: "Customer Feedback Form",
      description: "A simple form to collect customer feedback after a service.",
      category: "Customer Service",
      content: {
        sections: [
          {
            id: "section1",
            title: "Customer Information",
            description: "Details about the customer.",
            displayOrder: 1,
            fields: [
              {
                id: "name",
                label: "Name",
                fieldType: "text",
                required: true,
                placeholder: "Enter your name",
                displayOrder: 1,
                validationRules: {
                  minLength: 2,
                  maxLength: 50,
                },
              },
              {
                id: "email",
                label: "Email",
                fieldType: "email",
                required: true,
                placeholder: "Enter your email",
                displayOrder: 2,
                validationRules: {
                  pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
                },
              },
            ],
          },
          {
            id: "section2",
            title: "Feedback",
            description: "Your feedback about our service.",
            displayOrder: 2,
            fields: [
              {
                id: "rating",
                label: "Rating",
                fieldType: "select",
                required: true,
                placeholder: "Select a rating",
                displayOrder: 1,
                validationRules: {},
              },
              {
                id: "comments",
                label: "Comments",
                fieldType: "textarea",
                required: false,
                placeholder: "Enter your comments",
                displayOrder: 2,
                validationRules: {
                  maxLength: 500,
                },
              },
            ],
          },
        ],
      },
    },
  ];
  
  // Update the formTemplates array to comply with the FormTemplate type
  const transformedTemplates: FormTemplate[] = formTemplates.map(template => ({
    ...template,
    content: {
      sections: template.content.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => ({
          ...field,
          type: field.fieldType || 'text', // Ensure 'type' is present
        })),
      })),
    }
  }));
  
  // Use the transformed templates in your component
  
  return (
    <Table>
      <TableCaption>A list of your form templates.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transformedTemplates.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">{template.id}</TableCell>
            <TableCell>{template.name}</TableCell>
            <TableCell>{template.category}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>
            {transformedTemplates.length} Form Templates
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
