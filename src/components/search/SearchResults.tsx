
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Package, 
  Wrench, 
  User, 
  ClipboardList 
} from "lucide-react";
import { SearchResult, SearchResultType } from "@/utils/searchUtils";

interface SearchResultsProps {
  results: SearchResult[];
  onItemClick: () => void;
}

export function SearchResults({ results, onItemClick }: SearchResultsProps) {
  const navigate = useNavigate();

  // Get icon based on result type
  const getIcon = (type: SearchResultType) => {
    switch (type) {
      case 'work-order':
        return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case 'invoice':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'customer':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'equipment':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'inventory':
        return <Package className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleItemClick = (url: string) => {
    navigate(url);
    onItemClick();
  };

  return (
    <div className="bg-white rounded-md shadow-lg border border-gray-200 w-full max-w-md max-h-[70vh] overflow-y-auto">
      {results.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No results found
        </div>
      ) : (
        <ul className="py-2">
          {results.map((result) => (
            <li 
              key={`${result.type}-${result.id}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleItemClick(result.url)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
