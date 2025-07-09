import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Download, Eye, Save, BarChart3, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  category: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

const availableFields: ReportField[] = [
  { id: 'customer_name', name: 'Customer Name', type: 'text', category: 'Customer' },
  { id: 'work_order_number', name: 'Work Order #', type: 'text', category: 'Work Order' },
  { id: 'total_cost', name: 'Total Cost', type: 'currency', category: 'Financial' },
  { id: 'created_date', name: 'Created Date', type: 'date', category: 'Dates' },
  { id: 'technician_name', name: 'Technician', type: 'text', category: 'Staff' },
];

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addField = (fieldId: string) => {
    if (!selectedFields.includes(fieldId)) {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const removeField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(id => id !== fieldId));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Fields</h3>
                <div className="space-y-2">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between">
                      <Label className="flex-1">{field.name}</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addField(field.id)}
                        disabled={selectedFields.includes(field.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Fields</h3>
                {selectedFields.length === 0 ? (
                  <p className="text-muted-foreground">No fields selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedFields.map((fieldId) => {
                      const field = availableFields.find(f => f.id === fieldId);
                      return (
                        <div key={fieldId} className="flex items-center justify-between p-2 border rounded">
                          <span>{field?.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeField(fieldId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t">
              <Button
                onClick={generateReport}
                disabled={selectedFields.length === 0 || isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <TrendingUp className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview Report
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                disabled={!reportName || selectedFields.length === 0}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}