import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react';

interface FeedbackItem {
  id: string;
  customerName: string;
  workOrderId: string;
  rating: number;
  comment: string;
  category: 'service' | 'staff' | 'pricing' | 'facility' | 'general';
  status: 'new' | 'reviewed' | 'responded' | 'resolved';
  createdAt: string;
  responseText?: string;
  respondedBy?: string;
  respondedAt?: string;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: '1',
    customerName: 'John Smith',
    workOrderId: 'WO-2024-1234',
    rating: 5,
    comment: 'Excellent service! My car was fixed quickly and the staff was very professional.',
    category: 'service',
    status: 'responded',
    createdAt: '2024-07-12',
    responseText: 'Thank you for your positive feedback! We appreciate your business.',
    respondedBy: 'Sarah Manager',
    respondedAt: '2024-07-12',
  },
  {
    id: '2',
    customerName: 'Mary Johnson',
    workOrderId: 'WO-2024-1235',
    rating: 3,
    comment: 'Service was okay but took longer than expected. Could improve communication about delays.',
    category: 'service',
    status: 'new',
    createdAt: '2024-07-11',
  },
  {
    id: '3',
    customerName: 'Robert Wilson',
    workOrderId: 'WO-2024-1236',
    rating: 4,
    comment: 'Good work overall. Fair pricing and clean facility.',
    category: 'general',
    status: 'reviewed',
    createdAt: '2024-07-10',
  },
  {
    id: '4',
    customerName: 'Lisa Brown',
    workOrderId: 'WO-2024-1237',
    rating: 2,
    comment: 'Not satisfied with the repair quality. Had to bring the car back.',
    category: 'service',
    status: 'new',
    createdAt: '2024-07-09',
  },
];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'responded': return 'default';
    case 'reviewed': return 'secondary';
    case 'resolved': return 'outline';
    default: return 'destructive';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'service': return 'bg-blue-100 text-blue-800';
    case 'staff': return 'bg-green-100 text-green-800';
    case 'pricing': return 'bg-yellow-100 text-yellow-800';
    case 'facility': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${
        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
      }`}
    />
  ));
};

export function FeedbackManager() {
  const [feedback] = useState<FeedbackItem[]>(mockFeedback);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responseText, setResponseText] = useState('');

  const filteredFeedback = feedback.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  );

  const handleRespond = () => {
    if (selectedFeedback && responseText.trim()) {
      // In a real app, this would send the response via API
      console.log('Sending response:', responseText);
      setResponseText('');
      // Update status to 'responded'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Feedback List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Feedback</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card
                key={item.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedFeedback?.id === item.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{item.customerName}</h3>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {renderStars(item.rating)}
                    <span className="text-sm text-muted-foreground">
                      ({item.rating}/5)
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.comment}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>WO: {item.workOrderId}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Detail & Response */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedFeedback ? 'Feedback Details' : 'Select Feedback'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFeedback ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{selectedFeedback.customerName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Work Order: {selectedFeedback.workOrderId}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Rating:</span>
                {renderStars(selectedFeedback.rating)}
                <span className="text-sm">({selectedFeedback.rating}/5)</span>
              </div>

              {/* Feedback Content */}
              <div>
                <h4 className="font-medium mb-2">Customer Comment:</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">{selectedFeedback.comment}</p>
                </div>
              </div>

              {/* Existing Response (if any) */}
              {selectedFeedback.responseText && (
                <div>
                  <h4 className="font-medium mb-2">Your Response:</h4>
                  <div className="bg-primary/10 p-3 rounded-md">
                    <p className="text-sm">{selectedFeedback.responseText}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Responded by {selectedFeedback.respondedBy} on{' '}
                      {selectedFeedback.respondedAt && new Date(selectedFeedback.respondedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Response Form */}
              {selectedFeedback.status !== 'responded' && selectedFeedback.status !== 'resolved' && (
                <div>
                  <h4 className="font-medium mb-2">Respond to Customer:</h4>
                  <Textarea
                    placeholder="Type your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleRespond} disabled={!responseText.trim()}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Response
                    </Button>
                    <Button variant="outline">
                      Mark as Reviewed
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Mark Positive
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Flag Issue
                </Button>
                <Button variant="outline" size="sm">
                  View Work Order
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Feedback Selected</h3>
              <p className="text-muted-foreground">
                Select a feedback item from the list to view details and respond
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
