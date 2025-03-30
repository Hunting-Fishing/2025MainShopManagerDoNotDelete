
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { FeedbackForm, FeedbackResponse } from '@/types/feedback';
import { format } from 'date-fns';

interface FeedbackAnalyticsHeaderProps {
  form: FeedbackForm;
  responses: FeedbackResponse[];
  onBackClick: () => void;
}

export const FeedbackAnalyticsHeader: React.FC<FeedbackAnalyticsHeaderProps> = ({ 
  form, 
  responses, 
  onBackClick 
}) => {
  const handleExportCSV = () => {
    if (!responses.length || !form) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    let headers = ["Response ID", "Customer ID", "Work Order ID", "Date", "Overall Rating", "NPS Score"];
    
    // Add question headers
    form.questions?.sort((a, b) => a.display_order - b.display_order).forEach(question => {
      headers.push(question.question.replace(/,/g, ' '));
    });
    
    csvContent += headers.join(",") + "\r\n";
    
    // Add data rows
    responses.forEach(response => {
      let row = [
        response.id,
        response.customer_id,
        response.work_order_id || "",
        format(new Date(response.submitted_at), 'yyyy-MM-dd HH:mm:ss'),
        response.overall_rating || "",
        response.nps_score || ""
      ];
      
      // Add question responses
      form.questions?.sort((a, b) => a.display_order - b.display_order).forEach(question => {
        const answer = response.response_data[question.id];
        if (answer === null || answer === undefined) {
          row.push("");
        } else if (typeof answer === 'boolean') {
          row.push(answer ? "Yes" : "No");
        } else {
          row.push(String(answer).replace(/,/g, ' '));
        }
      });
      
      csvContent += row.join(",") + "\r\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.title.replace(/\s+/g, '_')}_responses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Button>
        <h1 className="text-2xl font-bold">{form.title} - Analytics</h1>
      </div>
      
      <Button onClick={handleExportCSV} disabled={!responses.length} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export Responses
      </Button>
    </div>
  );
};

