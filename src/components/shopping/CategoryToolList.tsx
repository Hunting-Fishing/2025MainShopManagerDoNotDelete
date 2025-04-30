
import React from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { slugify } from '@/utils/slugUtils';

interface ToolCategory {
  category: string;
  description?: string;
  items: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

interface CategoryToolListProps {
  tools: ToolCategory[];
  title?: string;
  description?: string;
}

export const CategoryToolList: React.FC<CategoryToolListProps> = ({ 
  tools,
  title = "Tool Categories",
  description = "Browse our collection of automotive tools"
}) => {
  // Convert category name to slug for routing
  const getCategorySlug = (categoryName: string) => {
    return slugify(categoryName);
  };
  
  return (
    <div className="space-y-6">
      {title && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((category, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">
                    {category.category}
                  </h3>
                  <div className="flex gap-2">
                    {category.isPopular && (
                      <Badge className="bg-green-100 text-green-800 border border-green-300">
                        Popular
                      </Badge>
                    )}
                    {category.isNew && (
                      <Badge className="bg-purple-100 text-purple-800 border border-purple-300">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                )}
                
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                    {category.items.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2"></span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {category.items.length > 6 && (
                    <div className="text-sm text-muted-foreground">
                      +{category.items.length - 6} more items
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t p-3">
                <Link
                  to={`/shopping/categories/${getCategorySlug(category.category)}`}
                  className="flex items-center justify-between text-blue-600 hover:text-blue-800 font-medium text-sm group"
                >
                  <span>Browse {category.category}</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800">Looking for a specific tool?</h4>
          <p className="text-sm text-amber-700 mt-1">
            If you don't see what you need, visit our <Link to="/shopping/suggestions" className="underline font-medium">product suggestions</Link> page to request it.
          </p>
        </div>
      </div>
    </div>
  );
};
