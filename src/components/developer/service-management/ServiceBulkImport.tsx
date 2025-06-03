import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { ServiceStagedImport } from './ServiceStagedImport';
import { generateExcelTemplate } from '@/lib/services/excelParser';
import { exportToExcel } from '@/utils/export';
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/use-toast";
import { Upload, Download } from 'lucide-react';

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: any) => void;
  onExport: () => void;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Implement your import logic here
      onImport(file);
      toast({
        title: "Import initiated",
        description: "Service data import is in progress.",
      });
    } catch (error) {
      console.error("Error during import:", error);
      toast({
        title: "Import failed",
        description: "An error occurred during the import process.",
        variant: "destructive",
      });
    }
  };

  const handleTemplateDownload = () => {
    try {
      const template = generateExcelTemplate();
      const blob = new Blob([template], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'service_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Template downloaded",
        description: "Service template downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        title: "Template generation failed",
        description: "An error occurred while generating the template.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    if (!categories || categories.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no service data available for export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert categories data to a format suitable for excel export
      const exportData = categories.flatMap(category =>
        category.subcategories.flatMap(subcategory =>
          subcategory.jobs.map(job => ({
            Category: category.name,
            Subcategory: subcategory.name,
            Job: job.name,
            Description: job.description,
            EstimatedTime: job.estimatedTime,
            Price: job.price,
          }))
        )
      );

      exportToExcel(exportData, 'Service_Data');
      toast({
        title: "Export initiated",
        description: "Service data export is in progress.",
      });
    } catch (error) {
      console.error("Error during export:", error);
      toast({
        title: "Export failed",
        description: "An error occurred during the export process.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="staged" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staged">Staged Import</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="staged">
          <ServiceStagedImport
            categories={categories}
            onImportComplete={() => onImport({})}
          />
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <p>Upload a file to bulk import service data.</p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bulk-import-file"
                />
                <label htmlFor="bulk-import-file">
                  <Button asChild variant="secondary">
                    <label
                      htmlFor="bulk-import-file"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{file ? `Selected: ${file.name}` : 'Select File'}</span>
                    </label>
                  </Button>
                </label>
                <Button onClick={handleImport} disabled={!file}>
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export / Template</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <p>Download a template or export existing data.</p>
              <Button variant="secondary" onClick={handleTemplateDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="secondary" onClick={handleExportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceBulkImport;
