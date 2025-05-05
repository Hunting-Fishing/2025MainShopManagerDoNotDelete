
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { DuplicateItem } from '@/utils/search/duplicateSearch';

interface DuplicateSearchResultsProps {
  duplicates: DuplicateItem[];
  recommendations: string[];
  onClose: () => void;
  onRemoveDuplicate: (itemId: string, type: 'category' | 'subcategory' | 'job') => Promise<void>;
}

export const DuplicateSearchResults: React.FC<DuplicateSearchResultsProps> = ({
  duplicates,
  recommendations,
  onClose,
  onRemoveDuplicate
}) => {
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleRemove = async (itemId: string, type: 'category' | 'subcategory' | 'job') => {
    setRemovingId(itemId);
    try {
      await onRemoveDuplicate(itemId, type);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-full flex flex-col">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Duplicate Items Found
        </h2>
        <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-blue-700 p-1 h-8 w-8">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 overflow-y-auto flex-grow max-h-[60vh]">
        {duplicates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium text-gray-700">No duplicates found</p>
            <p className="text-gray-500 mt-2">Your service hierarchy doesn't contain any duplicate items.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Found {duplicates.length} potential {duplicates.length === 1 ? 'duplicate' : 'duplicates'} in your service hierarchy.
            </p>
            
            <div className="space-y-4 mt-4">
              {duplicates.map((duplicate, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 font-medium border-b border-gray-200">
                    Duplicate: "{duplicate.name}"
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-gray-600 mb-2">
                      This item appears in {duplicate.occurrences.length} locations:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {duplicate.occurrences.map((occurrence, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded text-sm"
                        >
                          <div>
                            <span className="font-medium">{occurrence.type === 'category' ? 'Category' : 
                                              occurrence.type === 'subcategory' ? 'Subcategory' : 'Service'}</span>
                            <span className="text-gray-500 mx-1">in</span>
                            <span className="text-blue-600">{occurrence.path}</span>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleRemove(occurrence.itemId, occurrence.type)}
                            disabled={removingId === occurrence.itemId}
                          >
                            {removingId === occurrence.itemId ? (
                              <span className="text-xs">Removing...</span>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                <span className="text-xs">Remove</span>
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {recommendations.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-md font-medium text-blue-800 mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                  {recommendations.map((recommendation, i) => (
                    <li key={i}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <Button
          onClick={onClose}
          className="px-4"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
