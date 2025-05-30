
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport?: (data: any) => void;
  onExport?: () => void;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [importData, setImportData] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const validateImportData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      const errors: string[] = [];

      if (!Array.isArray(parsed)) {
        errors.push('Data must be an array of service categories');
        setValidationErrors(errors);
        setIsValidJson(false);
        return;
      }

      // Validate each category
      parsed.forEach((category, index) => {
        if (!category.name) {
          errors.push(`Category ${index + 1}: Missing name`);
        }
        if (!category.subcategories || !Array.isArray(category.subcategories)) {
          errors.push(`Category ${index + 1}: Missing or invalid subcategories`);
        } else {
          category.subcategories.forEach((sub: any, subIndex: number) => {
            if (!sub.name) {
              errors.push(`Category ${index + 1}, Subcategory ${subIndex + 1}: Missing name`);
            }
            if (!sub.jobs || !Array.isArray(sub.jobs)) {
              errors.push(`Category ${index + 1}, Subcategory ${subIndex + 1}: Missing or invalid jobs`);
            }
          });
        }
      });

      setValidationErrors(errors);
      setIsValidJson(errors.length === 0);
    } catch (error) {
      setIsValidJson(false);
      setValidationErrors(['Invalid JSON format']);
    }
  };

  const handleImportDataChange = (value: string) => {
    setImportData(value);
    if (value.trim()) {
      validateImportData(value);
    } else {
      setIsValidJson(true);
      setValidationErrors([]);
    }
  };

  const handleImport = async () => {
    if (!isValidJson || !importData.trim()) {
      toast.error('Please provide valid JSON data');
      return;
    }

    setImporting(true);
    try {
      const data = JSON.parse(importData);
      if (onImport) {
        await onImport(data);
        toast.success('Services imported successfully');
        setImportData('');
        setValidationErrors([]);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import services');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const exportData = JSON.stringify(categories, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `service-hierarchy-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (onExport) {
      onExport();
    }
    
    toast.success('Service hierarchy exported successfully');
  };

  const generateSampleData = () => {
    const sampleData = [
      {
        name: "Sample Category",
        description: "A sample service category",
        subcategories: [
          {
            name: "Sample Subcategory",
            description: "A sample subcategory",
            jobs: [
              {
                name: "Sample Service",
                description: "A sample service job",
                estimatedTime: 60,
                price: 100
              }
            ]
          }
        ]
      }
    ];
    
    setImportData(JSON.stringify(sampleData, null, 2));
    validateImportData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Service Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Export your current service hierarchy as a JSON file for backup or sharing.
          </p>
          <div className="flex items-center gap-4">
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export to JSON
            </Button>
            <Badge variant="outline">
              {categories.length} categories
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Service Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Import service categories, subcategories, and jobs from a JSON file.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="import-data">JSON Data</Label>
            <Textarea
              id="import-data"
              placeholder="Paste your JSON data here..."
              value={importData}
              onChange={(e) => handleImportDataChange(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Validation Status */}
          {importData.trim() && (
            <Alert className={isValidJson ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {isValidJson ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {isValidJson ? (
                  'JSON data is valid and ready for import'
                ) : (
                  <div>
                    <p className="font-medium">Validation errors:</p>
                    <ul className="list-disc list-inside mt-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleImport}
              disabled={!isValidJson || !importData.trim() || importing}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? 'Importing...' : 'Import Services'}
            </Button>
            <Button variant="outline" onClick={generateSampleData} className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Sample
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
