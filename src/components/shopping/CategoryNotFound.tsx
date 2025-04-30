
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { ProductCategory } from '@/types/shopping';

interface CategoryNotFoundProps {
  slug: string;
  error: string;
  similarCategories: ProductCategory[];
  diagnosticInfo: string | null;
  onRetry: () => void;
}

export const CategoryNotFound: React.FC<CategoryNotFoundProps> = ({
  slug,
  error,
  similarCategories,
  diagnosticInfo,
  onRetry
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Add diagnostic information */}
      {diagnosticInfo && (
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Diagnostic Information</AlertTitle>
          <AlertDescription className="text-blue-700 whitespace-pre-line">
            {diagnosticInfo}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show similar category suggestions if available */}
      {similarCategories.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Similar Categories:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarCategories.map(cat => (
              <Button 
                key={cat.id} 
                variant="outline" 
                className="h-auto py-4 justify-start text-left"
                onClick={() => navigate(`/shopping/categories/${cat.slug}`)}
              >
                <div>
                  <div className="font-medium">{cat.name}</div>
                  {cat.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {cat.description}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
        <Button 
          onClick={onRetry} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw size={18} className="mr-1" />
          Retry Loading Category
        </Button>
        
        <Button 
          onClick={() => navigate('/shopping/categories')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} className="mr-1" />
          Browse All Categories
        </Button>
      </div>
    </div>
  );
};
