
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeedbackAnalytics as FeedbackAnalyticsType, FeedbackForm, FeedbackResponse } from '@/types/feedback';
import { 
  getFeedbackFormWithQuestions, 
  getFeedbackAnalytics,
  getFeedbackResponses
} from '@/services/feedbackService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ArrowLeft, BarChart as BarChartIcon, PieChart as PieChartIcon, Download } from 'lucide-react';
import { format } from 'date-fns';

export const FeedbackAnalytics: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [analytics, setAnalytics] = useState<FeedbackAnalyticsType | null>(null);
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!formId) return;
      
      setLoading(true);
      
      try {
        // Load form details
        const formData = await getFeedbackFormWithQuestions(formId);
        setForm(formData);
        
        // Load analytics
        const analyticsData = await getFeedbackAnalytics(formId);
        setAnalytics(analyticsData);
        
        // Load responses
        const responsesData = await getFeedbackResponses(formId);
        setResponses(responsesData);
        
      } catch (error) {
        console.error('Error loading feedback analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [formId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!form || !analytics) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/feedback/forms')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Button>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">Form not found or analytics not available</p>
        </div>
      </div>
    );
  }

  // Prepare NPS data for pie chart
  const npsData = [
    { name: 'Promoters', value: analytics.promoters, color: '#22c55e' },
    { name: 'Passives', value: analytics.passives, color: '#eab308' },
    { name: 'Detractors', value: analytics.detractors, color: '#ef4444' }
  ];

  // Prepare rating data for bar chart if there are any ratings
  const hasRatings = analytics.average_rating > 0;
  const ratingData = hasRatings ? [
    { name: '1 Star', value: responses.filter(r => r.overall_rating === 1).length },
    { name: '2 Stars', value: responses.filter(r => r.overall_rating === 2).length },
    { name: '3 Stars', value: responses.filter(r => r.overall_rating === 3).length },
    { name: '4 Stars', value: responses.filter(r => r.overall_rating === 4).length },
    { name: '5 Stars', value: responses.filter(r => r.overall_rating === 5).length }
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/feedback/forms')}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analytics.total_responses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {analytics.average_rating.toFixed(1)}
              <span className="text-lg text-gray-500">/5</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {Math.round(analytics.nps_score)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* NPS Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>NPS Breakdown</CardTitle>
            <CardDescription>Distribution of Promoters, Passives, and Detractors</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {analytics.total_responses > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={npsData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {npsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} responses`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <PieChartIcon className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No NPS data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Rating Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>How customers rated their experience</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {hasRatings ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} responses`, '']} />
                  <Bar dataKey="value" fill="#4f46e5" name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <BarChartIcon className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No rating data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Responses</CardTitle>
          <CardDescription>
            Showing the {Math.min(responses.length, 10)} most recent feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Customer ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Work Order</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Overall Rating</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">NPS Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.length > 0 ? (
                  responses.slice(0, 10).map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {format(new Date(response.submitted_at), 'PP p')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {response.customer_id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {response.work_order_id 
                          ? response.work_order_id.substring(0, 8) + '...' 
                          : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {response.overall_rating 
                          ? <div className="flex items-center">
                              {Array(response.overall_rating).fill(0).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {response.nps_score !== null && response.nps_score !== undefined
                          ? <span className={`px-2 py-1 rounded text-white ${
                              response.nps_score >= 9 
                                ? 'bg-green-500' 
                                : response.nps_score >= 7 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`}>
                              {response.nps_score}
                            </span>
                          : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No responses yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Star component for ratings
const Star = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
