
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Upload, Calendar } from 'lucide-react';

interface WorkOrderDocumentsProps {
  workOrderId: string;
}

// Mock documents data
const mockDocuments = [
  {
    id: '1',
    name: 'Vehicle Inspection Report.pdf',
    type: 'inspection',
    size: '2.4 MB',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    name: 'Parts Invoice #12345.pdf',
    type: 'invoice',
    size: '156 KB',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2024-01-15T14:20:00Z',
    status: 'pending'
  },
  {
    id: '3',
    name: 'Before_Repair_Photos.zip',
    type: 'photos',
    size: '8.7 MB',
    uploadedBy: 'Mike Wilson',
    uploadedAt: '2024-01-14T16:45:00Z',
    status: 'completed'
  }
];

export function WorkOrderDocuments({ workOrderId }: WorkOrderDocumentsProps) {
  const [documents] = useState(mockDocuments);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inspection': return 'bg-blue-100 text-blue-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'photos': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Documents & Files</CardTitle>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No documents uploaded yet
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">DOCUMENT</th>
                  <th className="text-left p-2 font-medium">TYPE</th>
                  <th className="text-left p-2 font-medium">SIZE</th>
                  <th className="text-left p-2 font-medium">UPLOADED</th>
                  <th className="text-center p-2 font-medium">STATUS</th>
                  <th className="text-center p-2 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900 truncate max-w-xs">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={`text-xs ${getTypeColor(doc.type)}`}>
                        {doc.type}
                      </Badge>
                    </td>
                    <td className="p-2 text-gray-600">{doc.size}</td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="text-gray-900 font-medium">{doc.uploadedBy}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        variant={doc.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
