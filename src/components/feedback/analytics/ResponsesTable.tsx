
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackResponse } from '@/types/feedback';
import { Star } from './Star';

interface ResponsesTableProps {
  responses: FeedbackResponse[];
}

export const ResponsesTable: React.FC<ResponsesTableProps> = ({ responses }) => {
  return (
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
  );
};

