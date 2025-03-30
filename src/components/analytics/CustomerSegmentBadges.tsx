
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  CustomerSegmentType, 
  analyzeCustomerSegments 
} from '@/utils/analytics/customerSegmentation';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerSegmentBadgesProps {
  customerId: string;
  className?: string;
}

export const CustomerSegmentBadges: React.FC<CustomerSegmentBadgesProps> = ({ 
  customerId,
  className 
}) => {
  const [segments, setSegments] = useState<CustomerSegmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const customerSegments = await analyzeCustomerSegments(customerId);
        setSegments(customerSegments);
      } catch (error) {
        console.error("Error fetching customer segments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [customerId]);

  // Get segment styling based on type
  const getSegmentStyle = (segment: CustomerSegmentType) => {
    switch (segment) {
      case 'high_value':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'medium_value':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'low_value':
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case 'new':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'at_risk':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'loyal':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case 'inactive':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Format segment name for display
  const formatSegmentName = (segment: CustomerSegmentType) => {
    return segment.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {segments.length > 0 ? (
        segments.map((segment) => (
          <Badge 
            key={segment} 
            variant="outline"
            className={getSegmentStyle(segment)}
          >
            {formatSegmentName(segment)}
          </Badge>
        ))
      ) : (
        <span className="text-sm text-muted-foreground">No segments assigned</span>
      )}
    </div>
  );
};
