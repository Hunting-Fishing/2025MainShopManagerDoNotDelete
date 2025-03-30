
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CustomerFormValues, predefinedSegments } from "./CustomerFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SegmentFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  disabled?: boolean;
}

type Segment = {
  id: string;
  name: string;
  color?: string;
  description?: string;
};

export const SegmentFields: React.FC<SegmentFieldsProps> = ({ form, disabled = false }) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
  const { toast } = useToast();
  
  const selectedSegments = form.watch("segments") || [];

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("customer_segments")
          .select("id, name, color, description")
          .order("name");

        if (error) {
          throw error;
        }

        // Fall back to predefined segments if none in database
        setSegments(data && data.length > 0 ? data : 
          predefinedSegments.map(s => ({ 
            id: s.id, 
            name: s.label, 
            color: s.color 
          })));
      } catch (error) {
        console.error("Error fetching segments:", error);
        // Fall back to predefined segments on error
        setSegments(predefinedSegments.map(s => ({ 
          id: s.id, 
          name: s.label, 
          color: s.color 
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [toast]);

  const handleAddSegment = () => {
    if (!selectedSegmentId || selectedSegments.includes(selectedSegmentId)) return;
    
    const newSegments = [...selectedSegments, selectedSegmentId];
    form.setValue("segments", newSegments);
    setSelectedSegmentId("");
  };

  const handleRemoveSegment = (segmentId: string) => {
    const newSegments = selectedSegments.filter(id => id !== segmentId);
    form.setValue("segments", newSegments);
  };

  const getSegmentById = (id: string) => {
    return segments.find(segment => segment.id === id);
  };

  const getSegmentColor = (id: string) => {
    const segment = getSegmentById(id);
    return segment?.color || "bg-gray-500";
  };

  const getSegmentName = (id: string) => {
    const segment = getSegmentById(id);
    return segment?.name || id;
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="segments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Segments</FormLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSegments.length > 0 ? (
                selectedSegments.map((segmentId) => (
                  <Badge 
                    key={segmentId} 
                    variant="outline"
                    className={`${getSegmentColor(segmentId)} text-white px-2 py-1 text-xs rounded-full flex items-center gap-1`}
                  >
                    <span>{getSegmentName(segmentId)}</span>
                    {!disabled && (
                      <X
                        size={14}
                        className="cursor-pointer"
                        onClick={() => handleRemoveSegment(segmentId)}
                      />
                    )}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No segments assigned</div>
              )}
            </div>
            {!disabled && (
              <div className="flex space-x-2">
                <Select
                  disabled={loading}
                  value={selectedSegmentId}
                  onValueChange={setSelectedSegmentId}
                >
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem 
                        key={segment.id} 
                        value={segment.id}
                        disabled={selectedSegments.includes(segment.id)}
                      >
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={handleAddSegment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
                  disabled={!selectedSegmentId || selectedSegments.includes(selectedSegmentId)}
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
