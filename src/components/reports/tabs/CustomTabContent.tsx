
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { ReportConfig } from '@/types/reports';

interface CustomTabContentProps {
  customReportConfig: ReportConfig | null;
  onGenerateReport: (config: ReportConfig) => void;
}

export function CustomTabContent({ customReportConfig, onGenerateReport }: CustomTabContentProps) {
  return (
    <div className="space-y-6">
      {customReportConfig ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{customReportConfig.title}</CardTitle>
              <CardDescription>{customReportConfig.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-10">
                <p className="text-lg font-medium mb-4">Custom Report Generated</p>
                <p className="text-muted-foreground mb-6">
                  Your custom report with {customReportConfig.fields.length} selected fields has been created.
                </p>
                <div className="border rounded-md p-4 bg-muted/20 text-left">
                  <h3 className="font-medium mb-2">Selected Fields:</h3>
                  <ul className="list-disc pl-5">
                    {customReportConfig.fields.map((field) => (
                      <li key={field} className="mb-1">{field}</li>
                    ))}
                  </ul>
                  
                  {customReportConfig.groupBy && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Grouped By:</h3>
                      <p>{customReportConfig.groupBy}</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Sorting:</h3>
                    <p>
                      {customReportConfig.sorting.field} ({customReportConfig.sorting.direction === 'asc' ? 'Ascending' : 'Descending'})
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-6">
                  In a complete implementation, this would display the actual report data according to your specifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 border rounded-md bg-muted/10">
          <h3 className="text-xl font-medium mb-2">No Custom Report Generated</h3>
          <p className="text-muted-foreground mb-6">Use the Custom Report builder to create your own reports.</p>
          <CustomReportBuilder onGenerateReport={onGenerateReport} />
        </div>
      )}
    </div>
  );
}
