import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    // Fetch existing segments from database
    const fetchSegments = async () => {
      setLoading(true);
      try {
        // Fetch real segments from database
        const { data: dbSegments, error } = await supabase
          .from('email_segments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching segments:', error);
          toast({
            title: "Error",
            description: "Failed to load segments",
            variant: "destructive"
          });
          return;
        }

        if (dbSegments) {
          setSegments(dbSegments);
        }
      } catch (error) {
        console.error("Error loading segments:", error);
        toast({
          title: "Error",
          description: "Failed to load segments",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSegment(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSegment = async () => {
    setLoading(true);
    try {
      // Save segment to database
      const { data, error } = await supabase
        .from('email_segments')
        .insert([{
          name: segment.name,
          description: segment.description,
          criteria: segment.criteria
        }])
        .select()
        .single();

      if (error) throw error;

      setSegments(prev => [...prev, data]);
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
            />
          </div>
          <div>
            <Button onClick={handleSaveSegment} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Segment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
