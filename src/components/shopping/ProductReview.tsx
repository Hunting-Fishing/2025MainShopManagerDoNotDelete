
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface ProductReviewProps {
  review: {
    id: string;
    user_name?: string;
    rating: number;
    review_title?: string;
    review_text?: string;
    created_at: string;
    helpful_votes?: number;
    is_verified_purchase?: boolean;
  };
}

export function ProductReview({ review }: ProductReviewProps) {
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="border-b pb-6 last:border-0 last:pb-0">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            {renderStarRating(review.rating)}
            {review.review_title && (
              <h4 className="font-medium">{review.review_title}</h4>
            )}
          </div>
          
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>{review.user_name || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(new Date(review.created_at))}</span>
            {review.is_verified_purchase && (
              <>
                <span className="mx-2">•</span>
                <span className="text-green-600">Verified Purchase</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {review.review_text && (
        <div className="mt-2">
          <p>{review.review_text}</p>
        </div>
      )}
      
      {review.helpful_votes && review.helpful_votes > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {review.helpful_votes} {review.helpful_votes === 1 ? 'person' : 'people'} found this helpful
        </div>
      )}
    </div>
  );
}
