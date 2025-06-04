
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Settings
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: any) => Promise<void>;
  onExport: () => void;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Please enter data to import');
      return;
    }

    setImporting(true);
    try {
      const data = JSON.parse(importData);
      await onImport(data);
      toast.success('Data imported successfully');
      setImportData('');
    } catch (error) {
      toast.error('Failed to import data. Please check the format.');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportData = {
        categories: categories,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `service-categories-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
      onExport();
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const generateSampleData = () => {
    const sampleData = {
      categories: [
        {
          id: 'sample-1',
          name: 'Sample Category',
          description: 'This is a sample category',
          subcategories: [
            {
              id: 'sample-1-1',
              name: 'Sample Subcategory',
              description: 'This is a sample subcategory',
              jobs: [
                {
                  id: 'sample-1-1-1',
                  name: 'Sample Job',
                  description: 'This is a sample job description',
                  estimatedTime: 60,
                  price: 100
                }
              ]
            }
          ]
        }
      ]
    };
    setImportData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Service Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Export your current service catalog as JSON for backup or migration purposes.
            </p>
            
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Subcategories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.reduce((sum, cat) => 
                    sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Jobs</div>
              </div>
            </div>

            <Button 
              onClick={handleExport}
              disabled={exporting || categories.length === 0}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export as JSON'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Service Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Warning:</strong> Importing data will replace your current service catalog. 
                Make sure to export your current data first as a backup.
              </div>
            </div>

            <div>
              <Label htmlFor="import-data">JSON Data</Label>
              <Textarea
                id="import-data"
                placeholder="Paste your JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateSampleData}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Load Sample Data
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={importing || !importData.trim()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
            </div>

            {/* Format Guide */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Expected JSON Format:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "categories": [
    {
      "id": "unique-id",
      "name": "Category Name",
      "description": "Optional description",
      "subcategories": [
        {
          "id": "unique-subcategory-id",
          "name": "Subcategory Name",
          "description": "Optional description",
          "jobs": [
            {
              "id": "unique-job-id",
              "name": "Job Name",
              "description": "Job description",
              "estimatedTime": 60,
              "price": 100
            }
          ]
        }
      ]
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
