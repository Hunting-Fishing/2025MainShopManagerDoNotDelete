
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: any[];
}

const initialSegment: Segment = {
  id: 'new-segment',
  name: '',
  description: '',
  criteria: [],
};

export function SegmentBuilder() {
  const [segment, setSegment] = useState<Segment>(initialSegment);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSegment(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSegment = async () => {
    setLoading(true);
    try {
      // Mock save operation - in real implementation this would save to customer_segments table
      const newSegment = {
        ...segment,
        id: `segment-${Date.now()}`,
        criteria: segment.criteria || []
      };
      
      setSegments(prev => [...prev, newSegment]);
      setSegment(initialSegment);
      
      toast({
        title: "Success",
        description: "Segment saved successfully"
      });
    } catch (error) {
      console.error("Error saving segment:", error);
      toast({
        title: "Error",
        description: "Failed to save segment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Segment Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={segment.name}
                onChange={handleInputChange}
                placeholder="Enter segment name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                name="description"
                value={segment.description}
                onChange={handleInputChange}
                placeholder="Describe this segment"
              />
            </div>
            <div>
              <Button onClick={handleSaveSegment} disabled={loading || !segment.name}>
                <Save className="h-4 w-4 mr-2" />
                Save Segment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {segments.map((seg) => (
                <div key={seg.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{seg.name}</h4>
                    <p className="text-sm text-slate-600">{seg.description}</p>
                  </div>
                  <Badge variant="outline">
                    {seg.criteria.length} criteria
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
