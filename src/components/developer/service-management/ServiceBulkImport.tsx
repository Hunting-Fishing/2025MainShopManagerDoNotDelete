
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { importExcelData } from '@/lib/services/serviceDatabase';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStats, setImportStats] = useState<{
    categories: number;
    subcategories: number;
    jobs: number;
  } | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setImporting(true);
    setProgress(0);
    setImportStatus('idle');

    try {
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header mapping
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain headers and at least one data row');
      }

      setProgress(25);

      // Map Excel columns to our expected format
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      const mappedData = dataRows.map(row => {
        const rowData: any = {};
        headers.forEach((header, index) => {
          const normalizedHeader = header.toLowerCase().trim();
          
          // Map common Excel column names to our expected fields
          if (normalizedHeader.includes('category') && !normalizedHeader.includes('sub')) {
            rowData.category = row[index];
          } else if (normalizedHeader.includes('subcategory') || normalizedHeader.includes('sub category')) {
            rowData.subcategory = row[index];
          } else if (normalizedHeader.includes('job') && normalizedHeader.includes('name')) {
            rowData.job_name = row[index];
          } else if (normalizedHeader.includes('description')) {
            rowData.job_description = row[index];
          } else if (normalizedHeader.includes('time') || normalizedHeader.includes('duration')) {
            rowData.estimated_time = row[index];
          } else if (normalizedHeader.includes('price') || normalizedHeader.includes('cost')) {
            rowData.price = row[index];
          }
        });
        
        return rowData;
      }).filter(row => row.category && row.job_name); // Only include rows with required fields

      setProgress(50);

      if (dataRows.length > 10000) {
        toast.warning(`Large dataset detected (${dataRows.length} rows). This may take several minutes to process.`);
      }

      // Import the data
      await importExcelData(mappedData);
      
      setProgress(75);

      // Calculate import statistics
      const uniqueCategories = new Set(mappedData.map(row => row.category)).size;
      const uniqueSubcategories = new Set(mappedData.map(row => `${row.category}_${row.subcategory || 'General'}`)).size;
      const totalJobs = mappedData.length;

      setImportStats({
        categories: uniqueCategories,
        subcategories: uniqueSubcategories,
        jobs: totalJobs
      });

      setProgress(100);
      setImportStatus('success');
      
      // Call the parent onImport callback
      await onImport(mappedData);
      
      toast.success(`Successfully imported ${totalJobs} jobs across ${uniqueCategories} categories`);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  }, [onImport]);

  const handleExport = useCallback(() => {
    try {
      // Flatten the hierarchical data for Excel export
      const exportData: any[] = [];
      
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(job => {
            exportData.push({
              Category: category.name,
              'Category Description': category.description || '',
              Subcategory: subcategory.name,
              'Subcategory Description': subcategory.description || '',
              'Job Name': job.name,
              'Job Description': job.description || '',
              'Estimated Time (minutes)': job.estimatedTime || '',
              'Price': job.price || ''
            });
          });
        });
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `service-hierarchy-export-${timestamp}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Exported ${exportData.length} jobs to ${filename}`);
      onExport();
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  }, [categories, onExport]);

  const totalJobs = categories.reduce((total, cat) => 
    total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload an Excel file (.xlsx) with service hierarchy data. The system can handle up to 10,000 jobs.
              </p>
              <div className="text-xs text-muted-foreground">
                Expected columns: Category, Subcategory, Job Name, Description, Estimated Time, Price
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={importing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-center text-muted-foreground">
                    Importing services... {progress}%
                  </p>
                </div>
              )}
            </div>

            {importStatus === 'success' && importStats && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Import successful! Added {importStats.jobs} jobs across {importStats.categories} categories and {importStats.subcategories} subcategories.
                </AlertDescription>
              </Alert>
            )}

            {importStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Import failed. Please check the file format and try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Export current service hierarchy to Excel format for backup or editing.
              </p>
              <div className="text-xs text-muted-foreground">
                Current database: {categories.length} categories, {totalJobs} total jobs
              </div>
            </div>

            <Button 
              onClick={handleExport}
              className="w-full"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle>Template & Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              For best results, ensure your Excel file follows this structure:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <strong>Category</strong><br />
                Main service category
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Subcategory</strong><br />
                Service subcategory (optional)
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Job Name</strong><br />
                Service job name (required)
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Description</strong><br />
                Job description (optional)
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Large datasets (1000+ rows) will be processed in batches. Please be patient during import.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
