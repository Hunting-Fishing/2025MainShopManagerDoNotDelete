import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Eye, Edit, FileText, CheckSquare, Calendar, Hash } from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Form {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  submissions: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

const mockForms: Form[] = [
  {
    id: '1',
    name: 'Customer Vehicle Inspection',
    description: 'Pre-service vehicle inspection form',
    fields: [
      { id: '1', type: 'text', label: 'Vehicle Make', required: true },
      { id: '2', type: 'text', label: 'Vehicle Model', required: true },
      { id: '3', type: 'number', label: 'Mileage', required: true },
      { id: '4', type: 'textarea', label: 'Customer Concerns', required: false },
    ],
    submissions: 45,
    status: 'published',
    createdAt: '2024-06-15',
  },
  {
    id: '2',
    name: 'Service Feedback',
    description: 'Post-service customer feedback form',
    fields: [
      { id: '1', type: 'select', label: 'Service Rating', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: '2', type: 'textarea', label: 'Comments', required: false },
    ],
    submissions: 78,
    status: 'published',
    createdAt: '2024-06-01',
  },
];

const fieldIcons = {
  text: <FileText className="h-4 w-4" />,
  textarea: <FileText className="h-4 w-4" />,
  select: <CheckSquare className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
};

export function FormBuilder() {
  const [forms] = useState<Form[]>(mockForms);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Forms List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Form Templates</CardTitle>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => (
              <Card 
                key={form.id} 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedForm?.id === form.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedForm(form)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{form.name}</h3>
                      <Badge variant={getStatusVariant(form.status)}>
                        {form.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>{form.fields.length} fields</span>
                      <span>{form.submissions} submissions</span>
                      <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Preview/Editor */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedForm ? 'Form Preview' : 'Select a Form'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedForm ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{selectedForm.name}</h3>
                <p className="text-muted-foreground">{selectedForm.description}</p>
              </div>
              
              <div className="space-y-4">
                {selectedForm.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      {fieldIcons[field.type]}
                      <span>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </Label>
                    
                    {field.type === 'text' && (
                      <Input placeholder={field.placeholder || field.label} />
                    )}
                    
                    {field.type === 'textarea' && (
                      <Textarea placeholder={field.placeholder || field.label} />
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {field.type === 'number' && (
                      <Input type="number" placeholder={field.placeholder || field.label} />
                    )}
                    
                    {field.type === 'date' && (
                      <Input type="date" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">Submit Form</Button>
                <Button variant="outline">Save Draft</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Form Selected</h3>
              <p className="text-muted-foreground">
                Select a form from the list to preview or create a new one
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}