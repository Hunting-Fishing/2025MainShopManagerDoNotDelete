
import React from 'react';
import { Button } from '@/components/ui/button';
import { DuplicateItem } from '@/utils/search/duplicateSearch';
import { 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Clipboard,
  X,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DuplicateSearchResultsProps {
  duplicates: DuplicateItem[];
  recommendations: string[];
  onClose: () => void;
  onRemoveDuplicate?: (itemId: string, type: 'category' | 'subcategory' | 'job') => Promise<void>;
}

export const DuplicateSearchResults: React.FC<DuplicateSearchResultsProps> = ({
  duplicates,
  recommendations,
  onClose,
  onRemoveDuplicate
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  const [removingItems, setRemovingItems] = React.useState<Record<string, boolean>>({});
  
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };
  
  const handleRemoveDuplicate = async (itemId: string, duplicateType: 'category' | 'subcategory' | 'job', itemName: string) => {
    if (!onRemoveDuplicate) return;
    
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));
      await onRemoveDuplicate(itemId, duplicateType);
      toast.success(`Successfully removed duplicate "${itemName}"`);
    } catch (error) {
      console.error("Error removing duplicate:", error);
      toast.error(`Failed to remove duplicate "${itemName}"`);
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };
  
  const getBadgeColor = (type: 'category' | 'subcategory' | 'job') => {
    switch (type) {
      case 'category':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'subcategory':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'job':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getTypeLabel = (type: 'category' | 'subcategory' | 'job') => {
    switch (type) {
      case 'category': return 'Category';
      case 'subcategory': return 'Subcategory';
      case 'job': return 'Service';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          <h2 className="text-lg font-semibold">Duplicate Search Results</h2>
          <Badge variant="outline" className="ml-3 bg-amber-50 text-amber-800 border-amber-200">
            {duplicates.length} Duplicates Found
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="md:col-span-2 p-5 border-r border-gray-200">
          <h3 className="font-medium mb-3">Found Items</h3>
          
          <ScrollArea className="h-[400px] pr-4">
            {duplicates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-green-50 p-3 rounded-full mb-3">
                  <Clipboard className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-gray-600">No duplicates found in your service hierarchy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {duplicates.map((duplicate, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(duplicate.name)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{duplicate.name}</span>
                        <Badge className={cn("ml-2 border", getBadgeColor(duplicate.type))}>
                          {getTypeLabel(duplicate.type)}
                        </Badge>
                        <Badge variant="outline" className="ml-2 bg-white">
                          {duplicate.occurrences.length} occurrences
                        </Badge>
                      </div>
                      {expandedItems[duplicate.name] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    {expandedItems[duplicate.name] && (
                      <div className="p-3 border-t border-gray-200 bg-white">
                        <ul className="space-y-2">
                          {duplicate.occurrences.map((occurrence, occIdx) => (
                            <li key={occIdx} className="flex justify-between items-center text-sm pl-2 border-l-2 border-blue-200 py-1">
                              <span className="text-gray-500">{occurrence.path}</span>
                              {onRemoveDuplicate && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  disabled={removingItems[occurrence.itemId]}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDuplicate(occurrence.itemId, duplicate.type, duplicate.name);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {removingItems[occurrence.itemId] ? "Removing..." : "Remove"}
                                </Button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="p-5 bg-gray-50">
          <h3 className="font-medium mb-3">Recommendations</h3>
          <ul className="space-y-3">
            {recommendations.map((recommendation, i) => (
              <li key={i} className="flex text-sm">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-sm">Actions</h4>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Could export the data to CSV in the future
                  const jsonString = JSON.stringify(duplicates, null, 2);
                  navigator.clipboard.writeText(jsonString);
                  toast.success("Duplicate data copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
